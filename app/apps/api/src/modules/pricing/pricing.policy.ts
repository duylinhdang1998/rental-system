import type { LateReturnPolicy, PricingTier } from '@rental/contracts';

const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_SECOND = 1000;
const PERCENT_BASE = 100;
const DAY_MS = HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND;
const MINUTE_MS = SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND;
const HOUR_MS = MINUTES_PER_HOUR * MINUTE_MS;

export function billableRentalDays(startAt: string, endAt: string): number {
  const duration = Date.parse(endAt) - Date.parse(startAt);
  if (!Number.isFinite(duration) || duration <= 0) throw new Error('Invalid rental interval');
  return Math.max(1, Math.ceil(duration / DAY_MS));
}

export function calculateLateReturnFee(
  scheduledEndAt: string,
  actualReturnAt: string,
  policy: LateReturnPolicy,
) {
  const scheduled = Date.parse(scheduledEndAt);
  const actual = Date.parse(actualReturnAt);
  if (!Number.isFinite(scheduled) || !Number.isFinite(actual)) {
    throw new Error('Invalid return time');
  }
  const lateDuration = Math.max(0, actual - scheduled);
  const graceDuration = policy.graceMinutes * MINUTE_MS;
  const chargeableDuration = Math.max(0, lateDuration - graceDuration);
  const billableLateHours = Math.ceil(chargeableDuration / HOUR_MS);
  return {
    actualReturnAt,
    billableLateHours,
    feeVnd: billableLateHours * policy.hourlyRateVnd,
    graceMinutes: policy.graceMinutes,
    hourlyRateVnd: policy.hourlyRateVnd,
    lateMinutes: Math.ceil(lateDuration / MINUTE_MS),
    scheduledEndAt,
  };
}

export function calculateTierPrice(days: number, tiers: PricingTier[]) {
  const tier = tiers.find(
    (candidate) => days >= candidate.minDays && (!candidate.maxDays || days <= candidate.maxDays),
  );
  if (!tier) throw new Error('No pricing tier covers the rental duration');
  return { dailyRateVnd: tier.dailyRateVnd, subtotalVnd: tier.dailyRateVnd * days };
}

export function applyPercentAdjustment(subtotalVnd: number, percent: number): number {
  return Math.round((subtotalVnd * (PERCENT_BASE - percent)) / PERCENT_BASE);
}

export function validatePricingTiers(tiers: PricingTier[]): boolean {
  const sorted = [...tiers].sort((left, right) => left.minDays - right.minDays);
  if (!sorted.length || sorted.at(-1)?.maxDays !== null) return false;
  return sorted.every((tier, index) => {
    const previous = sorted[index - 1];
    if (index === 0) return tier.minDays === 1;
    return Boolean(previous && previous.maxDays !== null && tier.minDays === previous.maxDays + 1);
  });
}
