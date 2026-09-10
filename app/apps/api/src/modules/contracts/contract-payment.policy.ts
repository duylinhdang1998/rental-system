import {
  paymentBalance,
  paymentCap,
  type BalanceSource,
  type ContractStatus,
  type PaymentBalance,
  type PaymentKind,
  type RentalContract,
} from '@rental/contracts';
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

export function contractPaymentCap(contract: RentalContract, kind: PaymentKind): number {
  return paymentCap(balanceSource(contract), kind);
}

export function lastPaymentAt(contract: RentalContract): string | null {
  const stamps = contract.payments.map((payment) => payment.receivedAt).sort();
  return stamps.at(-1) ?? null;
}
