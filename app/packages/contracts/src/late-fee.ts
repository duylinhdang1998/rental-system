import type { LateReturnPolicy } from './pricing.js';

const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_SECOND = 1000;
const MINUTES_PER_HOUR = 60;
const MINUTE_MS = SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND;
const HOUR_MS = MINUTES_PER_HOUR * MINUTE_MS;

export interface LateReturnFee {
  actualReturnAt: string;
  billableLateHours: number;
  feeVnd: number;
  graceMinutes: number;
  hourlyRateVnd: number;
  lateMinutes: number;
  scheduledEndAt: string;
}

/**
 * PD-05 / BR-06: grace minutes are free, every started hour after that costs the snapshotted rate.
 * Shared by the API (charges) and the admin (preview) so both always agree.
 */
export function calculateLateReturnFee(
  scheduledEndAt: string,
  actualReturnAt: string,
  policy: LateReturnPolicy,
): LateReturnFee {
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
