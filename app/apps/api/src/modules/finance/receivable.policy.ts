import {
  BUSINESS_TIME_ZONE,
  MILLISECONDS_PER_DAY,
  businessDayKey,
  type AgingBucket,
  type AgingRow,
  type ReceivableAging,
  type ReceivableItem,
  type ReceivableList,
  type RentalContract,
} from '@rental/contracts';
import { contractBalance, lastPaymentAt } from '../contracts/contract-payment.policy.js';

const AGING_BUCKETS: readonly AgingBucket[] = ['CURRENT', 'DAYS_1_7', 'DAYS_8_30', 'OVER_30'];
const SEVEN_DAYS = 7;
const THIRTY_DAYS = 30;

/** Whole business days between two instants (Asia/Ho_Chi_Minh calendar), never negative. */
export function businessDaysBetween(from: string | Date, to: string | Date): number {
  const start = Date.parse(`${businessDayKey(from)}T00:00:00Z`);
  const end = Date.parse(`${businessDayKey(to)}T00:00:00Z`);
  return Math.max(0, Math.round((end - start) / MILLISECONDS_PER_DAY));
}

/** Money is owed once the rental ended or the vehicles came back; bookings are not debts. */
function receivableDueAt(contract: RentalContract, now: Date): string | null {
  if (contract.status === 'CANCELLED' || contract.status === 'CONFIRMED') return null;
  if (contract.status === 'COMPLETED') return contract.completedAt ?? contract.quote.endAt;
  return Date.parse(contract.quote.endAt) <= now.getTime() ? contract.quote.endAt : null;
}

export function receivableItem(contract: RentalContract, now: Date): ReceivableItem | null {
  const dueAt = receivableDueAt(contract, now);
  const balance = contractBalance(contract);
  if (!dueAt || balance.remainingVnd <= 0) return null;
  return {
    code: contract.code,
    contractId: contract.id,
    customerName: contract.quote.customerName,
    daysOutstanding: businessDaysBetween(dueAt, now),
    dueAt,
    lastPaymentAt: lastPaymentAt(contract),
    paidVnd: balance.paidVnd,
    remainingVnd: balance.remainingVnd,
    settledAt: contract.settledAt,
    status: contract.status,
    totalDueVnd: balance.totalDueVnd,
  };
}

/** Oldest debt first so staff chase what has waited the longest. */
export function receivableList(contracts: readonly RentalContract[], now: Date): ReceivableList {
  const items = contracts
    .flatMap((contract) => receivableItem(contract, now) ?? [])
    .sort((left, right) => Date.parse(left.dueAt) - Date.parse(right.dueAt));
  return {
    count: items.length,
    generatedAt: now.toISOString(),
    items,
    overSevenDays: items.filter((item) => item.daysOutstanding > SEVEN_DAYS).length,
    timeZone: BUSINESS_TIME_ZONE,
    totalRemainingVnd: items.reduce((sum, item) => sum + item.remainingVnd, 0),
  };
}

export function agingBucket(daysOutstanding: number): AgingBucket {
  if (daysOutstanding <= 0) return 'CURRENT';
  if (daysOutstanding <= SEVEN_DAYS) return 'DAYS_1_7';
  return daysOutstanding <= THIRTY_DAYS ? 'DAYS_8_30' : 'OVER_30';
}

export function receivableAging(items: readonly ReceivableItem[]): ReceivableAging {
  const rows: AgingRow[] = AGING_BUCKETS.map((bucket) => {
    const matching = items.filter((item) => agingBucket(item.daysOutstanding) === bucket);
    return {
      bucket,
      count: matching.length,
      totalVnd: matching.reduce((sum, item) => sum + item.remainingVnd, 0),
    };
  });
  return {
    count: items.length,
    rows,
    totalVnd: items.reduce((sum, item) => sum + item.remainingVnd, 0),
  };
}
