export const ISO_DATE_LENGTH = 10;
export const MILLISECONDS_PER_DAY = 86_400_000;
export const MILLISECONDS_PER_HOUR = 3_600_000;
export const BUSINESS_TIME_ZONE = 'Asia/Ho_Chi_Minh';

const dayFormatters = new Map<string, Intl.DateTimeFormat>();

function dayFormatter(timeZone: string): Intl.DateTimeFormat {
  const existing = dayFormatters.get(timeZone);
  if (existing) return existing;
  const created = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone,
    year: 'numeric',
  });
  dayFormatters.set(timeZone, created);
  return created;
}

/** Calendar day (YYYY-MM-DD) of an instant in the business time zone. */
export function businessDayKey(at: Date | string, timeZone = BUSINESS_TIME_ZONE): string {
  return dayFormatter(timeZone).format(new Date(at));
}

export function sameBusinessDay(
  first: Date | string,
  second: Date | string,
  timeZone = BUSINESS_TIME_ZONE,
): boolean {
  return businessDayKey(first, timeZone) === businessDayKey(second, timeZone);
}

/** Whole hours elapsed since a scheduled instant; never negative. */
export function hoursLate(scheduledAt: Date | string, now: Date | string): number {
  const elapsed = new Date(now).getTime() - new Date(scheduledAt).getTime();
  return Math.max(0, Math.floor(elapsed / MILLISECONDS_PER_HOUR));
}
