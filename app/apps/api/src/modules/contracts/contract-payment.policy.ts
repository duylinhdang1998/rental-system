import {
  paymentBalance,
  paymentCap,
  type BalanceSource,
  type ContractStatus,
  type ManualPaymentKind,
  type PaymentBalance,
  type RentalContract,
} from '@rental/contracts';
import { DomainError } from '../../common/errors/domain.error.js';
import { buildStatement } from './contract-settlement.policy.js';

/** Cancelled contracts never carry money; every other status can collect or refund. */
export const PAYABLE_CONTRACT_STATUSES: readonly ContractStatus[] = [
  'CONFIRMED',
  'ACTIVE',
  'OVERDUE',
  'COMPLETED',
];

export function paymentAllowed(contract: RentalContract): boolean {
  return PAYABLE_CONTRACT_STATUSES.includes(contract.status);
}

/** The single place that turns a contract into the inputs of the shared balance math. */
export function balanceSource(contract: RentalContract): BalanceSource {
  return {
    payments: contract.payments,
    settlement: contract.settlement,
    totalDueVnd: buildStatement(contract, { paidVnd: 0 }).totalDueVnd,
  };
}

export function contractBalance(contract: RentalContract): PaymentBalance {
  return paymentBalance(balanceSource(contract));
}

export function contractPaymentCap(contract: RentalContract, kind: ManualPaymentKind): number {
  return paymentCap(balanceSource(contract), kind);
}

/** US-028: only a settled contract with a positive frozen refund that has not left the ledger. */
export function depositRefundDue(contract: RentalContract): number {
  const { settlement } = contract;
  if (!settlement) {
    throw new DomainError('CONTRACT_NOT_SETTLED', 'Chỉ hoàn cọc sau khi tất toán hợp đồng');
  }
  if (settlement.refundVnd === 0) {
    throw new DomainError('NO_DEPOSIT_REFUND_DUE', 'Hợp đồng không có tiền cọc phải hoàn');
  }
  if (settlement.depositRefunded) {
    throw new DomainError('DEPOSIT_ALREADY_REFUNDED', 'Tiền cọc đã được hoàn cho khách');
  }
  return settlement.refundVnd;
}

export function lastPaymentAt(contract: RentalContract): string | null {
  const stamps = contract.payments.map((payment) => payment.receivedAt).sort();
  return stamps.at(-1) ?? null;
}
