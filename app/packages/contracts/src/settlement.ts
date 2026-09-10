import type { SettlementFigures } from './returns.js';

export interface SettlementInputs {
  chargesVnd: number;
  depositAppliedVnd?: number | undefined;
  depositVnd: number;
  discountsVnd: number;
  paidVnd: number;
}

/** The deposit can only cover what is still outstanding and never more than was held. */
export function maxDepositApplied(depositVnd: number, outstandingVnd: number): number {
  return Math.min(depositVnd, outstandingVnd);
}

/**
 * BR-04: every figure carries an explicit direction. `receivableVnd` is owed by the customer,
 * `refundVnd` is owed to the customer; both are non-negative and never folded into one signed value.
 * Shared by the API (settlement snapshot) and the admin (live preview) so both always agree.
 */
export function settlementFigures(input: SettlementInputs): SettlementFigures {
  const totalDueVnd = Math.max(0, input.chargesVnd - input.discountsVnd);
  const outstandingVnd = Math.max(0, totalDueVnd - input.paidVnd);
  const cap = maxDepositApplied(input.depositVnd, outstandingVnd);
  const depositAppliedVnd = Math.min(Math.max(0, input.depositAppliedVnd ?? cap), cap);
  return {
    chargesVnd: input.chargesVnd,
    depositAppliedVnd,
    depositVnd: input.depositVnd,
    discountsVnd: input.discountsVnd,
    outstandingVnd,
    paidVnd: input.paidVnd,
    receivableVnd: outstandingVnd - depositAppliedVnd,
    refundVnd: input.depositVnd - depositAppliedVnd,
    totalDueVnd,
  };
}
