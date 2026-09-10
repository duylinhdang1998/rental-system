import {
  BUSINESS_TIME_ZONE,
  MAX_REPORT_DAYS,
  MILLISECONDS_PER_DAY,
  type ReportRange,
} from '@rental/contracts';
import { DomainError } from '../../common/errors/domain.error.js';

/** Asia/Ho_Chi_Minh has no daylight saving, so a fixed offset is exact. */
const BUSINESS_OFFSET = '+07:00';

export interface ReportWindow extends ReportRange {
  /** Exclusive end instant (start of the day after `to`). */
  endAt: Date;
  startAt: Date;
  timeZone: string;
}

export function dayStart(day: string): Date {
  return new Date(`${day}T00:00:00${BUSINESS_OFFSET}`);
}

export function daySpan(range: ReportRange): number {
  return Math.round(
    (dayStart(range.to).getTime() - dayStart(range.from).getTime()) / MILLISECONDS_PER_DAY,
  );
}

export function reportWindow(range: ReportRange): ReportWindow {
  const startAt = dayStart(range.from);
  const toStart = dayStart(range.to);
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(toStart.getTime())) {
    throw new DomainError('INVALID_INPUT', 'Khoảng thời gian không hợp lệ');
  }
  if (toStart < startAt) {
    throw new DomainError('INVALID_INPUT', 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu');
  }
  if (daySpan(range) >= MAX_REPORT_DAYS) {
    throw new DomainError('INVALID_INPUT', `Báo cáo tối đa ${MAX_REPORT_DAYS} ngày`);
  }
  return {
    ...range,
    endAt: new Date(toStart.getTime() + MILLISECONDS_PER_DAY),
    startAt,
    timeZone: BUSINESS_TIME_ZONE,
  };
}
