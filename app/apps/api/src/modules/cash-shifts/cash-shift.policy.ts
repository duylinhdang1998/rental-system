import {
  cashNoteRequired,
  cashVariance,
  expectedCash,
  type AuthenticatedUser,
  type CashMovements,
  type CashShiftCloseInput,
  type CashShiftExpectation,
  type PaymentKind,
  type RentalContract,
} from '@rental/contracts';
import { DomainError } from '../../common/errors/domain.error.js';
import type { ExpenseRecord } from '../economics/economics.types.js';
import type { CashShiftCloseDraft, CashShiftRecord } from './cash-shift.types.js';

/** Epoch milliseconds, `[startAt, endAt)`. */
export interface MovementWindow {
  endAt: number;
  startAt: number;
}

const PAYMENT_FIELD: Record<PaymentKind, keyof CashMovements> = {
  DEPOSIT_REFUND: 'depositRefundedVnd',
  PAYMENT: 'cashCollectedVnd',
  REFUND: 'cashRefundedVnd',
};

function inWindow(window: MovementWindow, at: string): boolean {
  const time = Date.parse(at);
  return time >= window.startAt && time < window.endAt;
}

/**
 * US-027: cash that crossed the counter while the shift was open. Ledger rows count by
 * `receivedAt`, expenses by `createdAt` (the paid day is a business day, not a moment);
 * a reversal adds its amount back.
 */
export function cashMovements(
  contracts: readonly RentalContract[],
  expenses: readonly ExpenseRecord[],
  window: MovementWindow,
): CashMovements {
  const movements: CashMovements = {
    cashCollectedVnd: 0,
    cashExpensesVnd: 0,
    cashRefundedVnd: 0,
    depositRefundedVnd: 0,
  };
  for (const contract of contracts) {
    for (const payment of contract.payments) {
      if (payment.method !== 'CASH' || !inWindow(window, payment.receivedAt)) continue;
      movements[PAYMENT_FIELD[payment.kind]] += payment.amountVnd;
    }
  }
  for (const expense of expenses) {
    if (expense.method !== 'CASH' || !inWindow(window, expense.createdAt)) continue;
    movements.cashExpensesVnd += expense.reversalOfId ? -expense.amountVnd : expense.amountVnd;
  }
  return movements;
}

export function buildExpectation(
  shift: CashShiftRecord,
  movements: CashMovements,
  asOf: Date,
): CashShiftExpectation {
  return {
    ...movements,
    asOf: asOf.toISOString(),
    expectedCashVnd: expectedCash(shift.openingFloatVnd, movements),
    openingFloatVnd: shift.openingFloatVnd,
  };
}

/** The variance is frozen with the close; a non-zero variance must carry a note. */
export function closeDraft(
  expectation: CashShiftExpectation,
  input: CashShiftCloseInput,
  closedById: string,
  closedAt: string,
): CashShiftCloseDraft {
  const varianceVnd = cashVariance(input.countedCashVnd, expectation.expectedCashVnd);
  if (cashNoteRequired(varianceVnd, input.note)) {
    throw new DomainError(
      'CASH_SHIFT_NOTE_REQUIRED',
      'Ghi chú bắt buộc khi tiền đếm được lệch với tiền phải có',
    );
  }
  return {
    closedAt,
    closedById,
    countedCashVnd: input.countedCashVnd,
    expectedCashVnd: expectation.expectedCashVnd,
    note: input.note,
    varianceVnd,
  };
}

/** BR-08: the opener closes their own shift; the Owner may close anyone's. */
export function canCloseShift(shift: CashShiftRecord, actor: AuthenticatedUser): boolean {
  return actor.role === 'OWNER' || shift.openedById === actor.id;
}

export function compareShiftsNewestFirst(left: CashShiftRecord, right: CashShiftRecord): number {
  return Date.parse(right.openedAt) - Date.parse(left.openedAt);
}
