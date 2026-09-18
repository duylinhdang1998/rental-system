import {
  BUSINESS_TIME_ZONE,
  MAX_ANALYTICS_DAYS,
  MILLISECONDS_PER_DAY,
  type ReportRange,
} from '@rental/contracts';
import { DomainError } from '../../common/errors/domain.error.js';
import { dayStart, daySpan, type ReportWindow } from '../finance/report-range.js';

export interface AnalyticsWindow extends ReportWindow {
  /** Calendar days covered, both ends inclusive. */
  days: number;
}

/** Same shape as the revenue window with the wider, year-long limit of the analytics reports. */
export function analyticsWindow(range: ReportRange): AnalyticsWindow {
  const startAt = dayStart(range.from);
  const toStart = dayStart(range.to);
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(toStart.getTime())) {
    throw new DomainError('INVALID_INPUT', 'Khoảng thời gian không hợp lệ');
  }
  if (toStart < startAt) {
    throw new DomainError('INVALID_INPUT', 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu');
  }
  const days = daySpan(range) + 1;
  if (days > MAX_ANALYTICS_DAYS) {
    throw new DomainError('INVALID_INPUT', `Báo cáo tối đa ${MAX_ANALYTICS_DAYS} ngày`);
  }
  return {
    ...range,
    days,
    endAt: new Date(toStart.getTime() + MILLISECONDS_PER_DAY),
    startAt,
    timeZone: BUSINESS_TIME_ZONE,
  };
}
