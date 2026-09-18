import { Inject, Injectable } from '@nestjs/common';
import type {
  AuthenticatedUser,
  CashShift,
  CashShiftCloseInput,
  CashShiftCurrent,
  CashShiftList,
  CashShiftOpenInput,
} from '@rental/contracts';
import { AuditService } from '../../common/audit/audit.service.js';
import { DomainError } from '../../common/errors/domain.error.js';
import { EmployeeDirectory } from '../auth/employee-directory.js';
import { CashExpectationService } from './cash-expectation.service.js';
import { canCloseShift, closeDraft } from './cash-shift.policy.js';
import { CASH_SHIFT_REPOSITORY } from './cash-shift.tokens.js';
import type { CashShiftRecord, CashShiftRepository } from './cash-shift.types.js';

const ENTITY_TYPE = 'CashShift';

/** US-027: one open shift per shop; the close freezes expected, counted and variance. */
@Injectable()
export class CashShiftService {
  constructor(
    @Inject(CASH_SHIFT_REPOSITORY) private readonly shifts: CashShiftRepository,
    private readonly expectations: CashExpectationService,
    private readonly employees: EmployeeDirectory,
    private readonly audit: AuditService,
  ) {}

  async open(input: CashShiftOpenInput, actor: AuthenticatedUser): Promise<CashShift> {
    if (await this.shifts.findOpen()) {
      throw new DomainError(
        'CASH_SHIFT_ALREADY_OPEN',
        'Đang có ca mở; đóng ca đó trước khi mở ca mới',
      );
    }
    const shift = await this.shifts.create({
      openedAt: new Date().toISOString(),
      openedById: actor.id,
      openingFloatVnd: input.openingFloatVnd,
    });
    await this.audit.record({
      action: 'CASH_SHIFT_OPENED',
      actorId: actor.id,
      entityId: shift.id,
      entityType: ENTITY_TYPE,
      metadata: { openingFloatVnd: shift.openingFloatVnd },
    });
    return this.withNames(shift);
  }

  async current(now = new Date()): Promise<CashShiftCurrent> {
    const shift = await this.shifts.findOpen();
    if (!shift) return { expectation: null, shift: null };
    return {
      expectation: await this.expectations.expectation(shift, now),
      shift: await this.withNames(shift),
    };
  }

  async close(id: string, input: CashShiftCloseInput, actor: AuthenticatedUser) {
    const shift = await this.shifts.findById(id);
    if (!shift) throw new DomainError('NOT_FOUND', 'Không tìm thấy ca tiền mặt');
    if (shift.status !== 'OPEN') throw new DomainError('CASH_SHIFT_NOT_OPEN', 'Ca này đã đóng');
    if (!canCloseShift(shift, actor)) {
      throw new DomainError('FORBIDDEN', 'Chỉ người mở ca hoặc Chủ cửa hàng được đóng ca');
    }
    const now = new Date();
    const expectation = await this.expectations.expectation(shift, now);
    const draft = closeDraft(expectation, input, actor.id, now.toISOString());
    const closed = await this.shifts.close(shift.id, draft);
    await this.audit.record({
      action: 'CASH_SHIFT_CLOSED',
      actorId: actor.id,
      entityId: closed.id,
      entityType: ENTITY_TYPE,
      metadata: {
        countedCashVnd: draft.countedCashVnd,
        expectedCashVnd: draft.expectedCashVnd,
        varianceVnd: draft.varianceVnd,
      },
    });
    return this.withNames(closed);
  }

  /** Staff reviews their own shifts; the Owner reviews every shift (BR-08). */
  async list(actor: AuthenticatedUser): Promise<CashShiftList> {
    const records = await this.shifts.list(actor.role === 'OWNER' ? undefined : actor.id);
    return { items: await this.withNamesAll(records) };
  }

  private async withNamesAll(records: readonly CashShiftRecord[]): Promise<CashShift[]> {
    const ids = records.flatMap((record) => [record.openedById, record.closedById ?? []].flat());
    const names = await this.employees.names(ids);
    return records.map((record) => ({
      ...record,
      closedByName: record.closedById ? (names.get(record.closedById) ?? record.closedById) : null,
      openedByName: names.get(record.openedById) ?? record.openedById,
    }));
  }

  private async withNames(record: CashShiftRecord): Promise<CashShift> {
    const [shift] = await this.withNamesAll([record]);
    return shift!;
  }
}
