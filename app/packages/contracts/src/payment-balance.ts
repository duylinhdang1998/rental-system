import type { PaymentBalance } from './finance.js';
import type { ContractPayment, PaymentKind } from './payments.js';
import type { ContractSettlement } from './returns.js';

export interface BalanceSource {
  payments: readonly ContractPayment[];
  settlement: Pick<ContractSettlement, 'paidVnd' | 'receivableVnd'> | null;
  totalDueVnd: number;
}

function sum(payments: readonly ContractPayment[], pick: (payment: ContractPayment) => boolean) {
  return payments.filter(pick).reduce((total, payment) => total + payment.amountVnd, 0);
}

/** Money collected minus money handed back; never negative once the refund cap is enforced. */
export function netPaid(payments: readonly ContractPayment[]): number {
  const paid = sum(payments, (payment) => payment.kind === 'PAYMENT');
  const refunded = sum(payments, (payment) => payment.kind === 'REFUND');
  return Math.max(0, paid - refunded);
}

/**
 * What the customer still owes. Before settlement it is the total due minus what was collected
 * (the deposit is only applied at settlement). After settlement the frozen receivable shrinks by
 * whatever was collected since the snapshot (BR-07 keeps the snapshot itself untouched).
 */
export function remainingReceivable(source: BalanceSource): number {
  const paid = netPaid(source.payments);
  if (source.settlement) {
    return Math.max(0, source.settlement.receivableVnd - (paid - source.settlement.paidVnd));
  }
  return Math.max(0, source.totalDueVnd - paid);
}

/** Payments are capped by the remaining receivable, refunds by the net amount collected. */
export function paymentCap(source: BalanceSource, kind: PaymentKind): number {
  return kind === 'REFUND' ? netPaid(source.payments) : remainingReceivable(source);
}

export function paymentBalance(source: BalanceSource): PaymentBalance {
  const { payments } = source;
  return {
    cashVnd: sum(payments, (payment) => payment.kind === 'PAYMENT' && payment.method === 'CASH'),
    paidVnd: netPaid(payments),
    refundedVnd: sum(payments, (payment) => payment.kind === 'REFUND'),
    remainingVnd: remainingReceivable(source),
    totalDueVnd: source.totalDueVnd,
    transferVnd: sum(
      payments,
      (payment) => payment.kind === 'PAYMENT' && payment.method === 'BANK_TRANSFER',
    ),
  };
}
