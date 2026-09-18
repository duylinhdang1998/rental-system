import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { DomainError } from '../../common/errors/domain.error.js';
import { compareShiftsNewestFirst } from './cash-shift.policy.js';
import type {
  CashShiftCloseDraft,
  CashShiftOpenDraft,
  CashShiftRecord,
  CashShiftRepository,
} from './cash-shift.types.js';

@Injectable()
export class DemoCashShiftRepository implements CashShiftRepository {
  private readonly shifts: CashShiftRecord[] = [];

  close(id: string, draft: CashShiftCloseDraft): Promise<CashShiftRecord> {
    const shift = this.shifts.find((item) => item.id === id);
    if (!shift) return Promise.reject(new DomainError('NOT_FOUND', 'Không tìm thấy ca tiền mặt'));
    Object.assign(shift, draft, { status: 'CLOSED' });
    return Promise.resolve({ ...shift });
  }

  create(draft: CashShiftOpenDraft): Promise<CashShiftRecord> {
    if (this.shifts.some((item) => item.status === 'OPEN')) {
      return Promise.reject(new DomainError('CASH_SHIFT_ALREADY_OPEN', 'Đang có một ca mở'));
    }
    const shift: CashShiftRecord = {
      ...draft,
      closedAt: null,
      closedById: null,
      countedCashVnd: null,
      expectedCashVnd: null,
      id: randomUUID(),
      note: '',
      status: 'OPEN',
      varianceVnd: null,
    };
    this.shifts.push(shift);
    return Promise.resolve({ ...shift });
  }

  findById(id: string): Promise<CashShiftRecord | null> {
    const shift = this.shifts.find((item) => item.id === id);
    return Promise.resolve(shift ? { ...shift } : null);
  }

  findOpen(): Promise<CashShiftRecord | null> {
    const shift = this.shifts.find((item) => item.status === 'OPEN');
    return Promise.resolve(shift ? { ...shift } : null);
  }

  list(openedById?: string): Promise<CashShiftRecord[]> {
    return Promise.resolve(
      this.shifts
        .filter((item) => openedById === undefined || item.openedById === openedById)
        .sort(compareShiftsNewestFirst)
        .map((item) => ({ ...item })),
    );
  }
}
