import { randomUUID } from 'node:crypto';
import {
  EXPENSE_CATEGORIES,
  type AuthenticatedUser,
  type Expense,
  type ExpenseInput,
  type ExpenseTotals,
} from '@rental/contracts';
import { DomainError } from '../../common/errors/domain.error.js';
import type { ExpenseDraft, ExpenseFilter, ExpenseRecord } from './economics.types.js';

/** A reversal row subtracts what its original added (BR-09). */
export function signedExpenseVnd(
  record: Pick<ExpenseRecord, 'amountVnd' | 'reversalOfId'>,
): number {
  return record.reversalOfId ? -record.amountVnd : record.amountVnd;
}

export function expenseTotals(records: readonly ExpenseRecord[]): ExpenseTotals {
  const byCategory = new Map<string, number>();
  const totals = { cashVnd: 0, netVnd: 0, reversedVnd: 0, transferVnd: 0 };
  for (const record of records) {
    const signed = signedExpenseVnd(record);
    totals.netVnd += signed;
    if (record.method === 'CASH') totals.cashVnd += signed;
    else totals.transferVnd += signed;
    if (record.reversalOfId) totals.reversedVnd += record.amountVnd;
    byCategory.set(record.category, (byCategory.get(record.category) ?? 0) + signed);
  }
  return {
    ...totals,
    byCategory: EXPENSE_CATEGORIES.filter((category) => byCategory.has(category)).map(
      (category) => ({ category, netVnd: byCategory.get(category) ?? 0 }),
    ),
  };
}

export function matchesExpenseFilter(record: ExpenseRecord, filter: ExpenseFilter): boolean {
  if (filter.from && record.paidOn < filter.from) return false;
  if (filter.to && record.paidOn > filter.to) return false;
  if (filter.category && record.category !== filter.category) return false;
  if (filter.vehicleId && record.vehicleId !== filter.vehicleId) return false;
  return true;
}

/** Newest paid day first; ties fall back to the newest created row. */
export function compareExpenses(first: ExpenseRecord, second: ExpenseRecord): number {
  if (first.paidOn !== second.paidOn) return first.paidOn < second.paidOn ? 1 : -1;
  return first.createdAt < second.createdAt ? 1 : -1;
}

export function expenseDraft(
  input: ExpenseInput,
  vehicleCode: string | null,
  actor: AuthenticatedUser,
): ExpenseDraft {
  return {
    amountVnd: input.amountVnd,
    category: input.category,
    description: input.description,
    idempotencyKey: input.idempotencyKey,
    method: input.method,
    notes: input.notes,
    paidOn: input.paidOn,
    recordedById: actor.id,
    reference: input.reference,
    reversalOfId: null,
    vehicleCode,
    vehicleId: input.vehicleId,
  };
}

/** Mirrors the original on every money-bearing field so the net returns to zero. */
export function reversalDraft(
  original: ExpenseRecord,
  reason: string,
  actor: AuthenticatedUser,
): ExpenseDraft {
  return {
    amountVnd: original.amountVnd,
    category: original.category,
    description: `Đảo: ${reason}`,
    idempotencyKey: randomUUID(),
    method: original.method,
    notes: '',
    paidOn: original.paidOn,
    recordedById: actor.id,
    reference: original.reference,
    reversalOfId: original.id,
    vehicleCode: original.vehicleCode,
    vehicleId: original.vehicleId,
  };
}

export function assertReversible(original: ExpenseRecord): void {
  if (original.reversalOfId) {
    throw new DomainError('INVALID_TRANSITION', 'Không thể đảo một bút toán đảo');
  }
  if (original.reversedByExpenseId) {
    throw new DomainError('INVALID_TRANSITION', 'Khoản chi đã được đảo trước đó');
  }
}

/** Same key with the same money, category, vehicle and day → replay; anything else is a conflict. */
export function assertSameExpenseReplay(stored: ExpenseRecord, input: ExpenseInput): void {
  const same =
    stored.amountVnd === input.amountVnd &&
    stored.category === input.category &&
    stored.vehicleId === input.vehicleId &&
    stored.paidOn === input.paidOn;
  if (!same) {
    throw new DomainError('CONFLICT', 'Khóa giao dịch đã được dùng cho một khoản chi khác');
  }
}

export function withRecorderName(record: ExpenseRecord, names: Map<string, string>): Expense {
  return { ...record, recordedByName: names.get(record.recordedById) ?? record.recordedById };
}
