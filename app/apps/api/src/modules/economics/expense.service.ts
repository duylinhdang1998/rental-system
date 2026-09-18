import { Inject, Injectable } from '@nestjs/common';
import type {
  AuthenticatedUser,
  Expense,
  ExpenseInput,
  ExpenseList,
  ExpenseListQuery,
  ExpenseReversalInput,
} from '@rental/contracts';
import { AuditService } from '../../common/audit/audit.service.js';
import { DomainError } from '../../common/errors/domain.error.js';
import { EmployeeDirectory } from '../auth/employee-directory.js';
import { FLEET_REPOSITORY } from '../fleet/fleet.tokens.js';
import type { FleetRepository } from '../fleet/fleet.types.js';
import { ECONOMICS_REPOSITORY } from './economics.tokens.js';
import type { EconomicsRepository, ExpenseRecord } from './economics.types.js';
import {
  assertReversible,
  assertSameExpenseReplay,
  expenseDraft,
  expenseTotals,
  reversalDraft,
  withRecorderName,
} from './expense.policy.js';

const ENTITY_TYPE = 'Expense';

/** US-024 / BR-09: append-only expense ledger; the Owner corrects mistakes with reversal rows. */
@Injectable()
export class ExpenseService {
  constructor(
    @Inject(ECONOMICS_REPOSITORY) private readonly repository: EconomicsRepository,
    @Inject(FLEET_REPOSITORY) private readonly fleet: FleetRepository,
    private readonly employees: EmployeeDirectory,
    private readonly audit: AuditService,
  ) {}

  async record(input: ExpenseInput, actor: AuthenticatedUser): Promise<Expense> {
    const replay = await this.repository.findExpenseByKey(input.idempotencyKey);
    if (replay) {
      assertSameExpenseReplay(replay, input);
      return this.named(replay);
    }
    const vehicleCode = await this.vehicleCode(input.vehicleId);
    const created = await this.repository.createExpense(expenseDraft(input, vehicleCode, actor));
    await this.audit.record({
      action: 'EXPENSE_RECORDED',
      actorId: actor.id,
      entityId: created.id,
      entityType: ENTITY_TYPE,
      metadata: {
        amountVnd: created.amountVnd,
        category: created.category,
        method: created.method,
        vehicleCode: created.vehicleCode,
      },
    });
    return this.named(created);
  }

  async reverse(
    id: string,
    input: ExpenseReversalInput,
    actor: AuthenticatedUser,
  ): Promise<Expense> {
    const original = await this.repository.findExpense(id);
    if (!original) throw new DomainError('NOT_FOUND', 'Không tìm thấy khoản chi');
    assertReversible(original);
    const created = await this.repository.createExpense(
      reversalDraft(original, input.reason, actor),
    );
    await this.audit.record({
      action: 'EXPENSE_REVERSED',
      actorId: actor.id,
      entityId: original.id,
      entityType: ENTITY_TYPE,
      metadata: { amountVnd: original.amountVnd, reason: input.reason, reversalId: created.id },
    });
    return this.named(created);
  }

  async list(query: ExpenseListQuery): Promise<ExpenseList> {
    const records = await this.repository.listExpenses(query);
    const names = await this.employees.names(records.map((record) => record.recordedById));
    return {
      count: records.length,
      items: records.map((record) => withRecorderName(record, names)),
      totals: expenseTotals(records),
    };
  }

  private async vehicleCode(vehicleId: string | null): Promise<string | null> {
    if (!vehicleId) return null;
    const vehicle = await this.fleet.findById(vehicleId);
    if (!vehicle) throw new DomainError('NOT_FOUND', 'Không tìm thấy xe');
    return vehicle.code;
  }

  private async named(record: ExpenseRecord): Promise<Expense> {
    const names = await this.employees.names([record.recordedById]);
    return withRecorderName(record, names);
  }
}
