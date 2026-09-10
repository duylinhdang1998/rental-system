import type { PaymentBalance, ReceivableItem } from '@rental/contracts';

export type ReceivableTone = 'danger' | 'info' | 'warning';

const WARNING_DAYS = 7;

/** Same thresholds as the aging buckets: fresh, first week, then overdue for real. */
export function receivableTone(daysOutstanding: number): ReceivableTone {
  if (daysOutstanding <= 0) return 'info';
  return daysOutstanding <= WARNING_DAYS ? 'warning' : 'danger';
}

export function oldestOutstandingDays(items: readonly ReceivableItem[]): number {
  return Math.max(0, ...items.map((item) => item.daysOutstanding));
}

/** The payment dialog only needs the two caps; the list row already carries both. */
export function receivableBalance(
  item: ReceivableItem,
): Pick<PaymentBalance, 'paidVnd' | 'remainingVnd'> {
  return { paidVnd: item.paidVnd, remainingVnd: item.remainingVnd };
}
