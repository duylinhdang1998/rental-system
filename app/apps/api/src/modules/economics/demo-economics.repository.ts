import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { VehicleAcquisition } from '@rental/contracts';
import { DomainError } from '../../common/errors/domain.error.js';
import type {
  AcquisitionDraft,
  EconomicsRepository,
  ExpenseDraft,
  ExpenseFilter,
  ExpenseRecord,
} from './economics.types.js';
import { compareExpenses, matchesExpenseFilter } from './expense.policy.js';

/** In-memory ledger for demo and tests; rows are only ever appended (BR-09). */
@Injectable()
export class DemoEconomicsRepository implements EconomicsRepository {
  private readonly acquisitions = new Map<string, VehicleAcquisition>();
  private readonly expenses: ExpenseRecord[] = [];
  /** idempotency key → row id; the key itself never leaves the repository. */
  private readonly keys = new Map<string, string>();

  createExpense(draft: ExpenseDraft): Promise<ExpenseRecord> {
    if (this.keys.has(draft.idempotencyKey)) {
      return Promise.reject(new DomainError('CONFLICT', 'Khóa giao dịch đã tồn tại'));
    }
    const { idempotencyKey, ...fields } = draft;
    const record: ExpenseRecord = {
      ...fields,
      createdAt: new Date().toISOString(),
      id: randomUUID(),
      reversedByExpenseId: null,
    };
    if (draft.reversalOfId) {
      const original = this.expenses.find((item) => item.id === draft.reversalOfId);
      if (original) original.reversedByExpenseId = record.id;
    }
    this.expenses.push(record);
    this.keys.set(idempotencyKey, record.id);
    return Promise.resolve({ ...record });
  }

  findAcquisition(vehicleId: string): Promise<VehicleAcquisition | null> {
    const stored = this.acquisitions.get(vehicleId);
    return Promise.resolve(stored ? { ...stored } : null);
  }

  findExpense(id: string): Promise<ExpenseRecord | null> {
    const record = this.expenses.find((item) => item.id === id);
    return Promise.resolve(record ? { ...record } : null);
  }

  findExpenseByKey(idempotencyKey: string): Promise<ExpenseRecord | null> {
    const id = this.keys.get(idempotencyKey);
    return id === undefined ? Promise.resolve(null) : this.findExpense(id);
  }

  listAcquisitions(): Promise<VehicleAcquisition[]> {
    return Promise.resolve([...this.acquisitions.values()].map((item) => ({ ...item })));
  }

  listExpenses(filter: ExpenseFilter): Promise<ExpenseRecord[]> {
    const matching = this.expenses
      .filter((item) => matchesExpenseFilter(item, filter))
      .sort(compareExpenses)
      .map((item) => ({ ...item }));
    return Promise.resolve(filter.limit === undefined ? matching : matching.slice(0, filter.limit));
  }

  upsertAcquisition(draft: AcquisitionDraft): Promise<VehicleAcquisition> {
    const stored: VehicleAcquisition = {
      purchasePriceVnd: draft.purchasePriceVnd,
      purchasedOn: draft.purchasedOn,
      salvageValueVnd: draft.salvageValueVnd,
      updatedAt: new Date().toISOString(),
      updatedById: draft.updatedById,
      usefulLifeMonths: draft.usefulLifeMonths,
      vehicleId: draft.vehicleId,
    };
    this.acquisitions.set(draft.vehicleId, stored);
    return Promise.resolve({ ...stored });
  }
}
