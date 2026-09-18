import { z } from 'zod';
import { REPORT_DAY_PATTERN } from './reporting.js';
import { chargeKindSchema } from './returns.js';
import { ISO_DATE_LENGTH } from './time.js';

const MAX_VND = 1_000_000_000_000;
const PERCENT = 100;
const MONTHS_PER_YEAR = 12;
const MONTH_KEY_LENGTH = 7;
const YEAR_DIGITS = 4;
const MONTH_DIGITS = 2;

/** A year and a day: enough for a twelve-month comparison including a leap day. */
export const MAX_ANALYTICS_DAYS = 366;
export const MAX_TREND_MONTHS = 24;
export const DEFAULT_TREND_MONTHS = 12;
export const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/u;
/** Row key for revenue that no vehicle earned (delivery fees, contract-level charges). */
export const UNALLOCATED_KEY = 'unallocated';

const vndSchema = z.number().int().min(0).max(MAX_VND);
const signedVndSchema = z.number().int().min(-MAX_VND).max(MAX_VND);
const countSchema = z.number().int().min(0);
const percentSchema = z.number().int().min(0).max(PERCENT);
const daySchema = z.string().regex(REPORT_DAY_PATTERN);
const monthSchema = z.string().regex(MONTH_PATTERN);

// ---------------------------------------------------------------------------
// Analytics report (US-029)
// ---------------------------------------------------------------------------

export const dimensionRowSchema = z.object({
  contractCount: countSchema,
  key: z.string(),
  label: z.string(),
  rentalDays: countSchema,
  revenueVnd: signedVndSchema,
  sharePercent: percentSchema,
});

export const monthRowSchema = z.object({
  contractCount: countSchema,
  month: monthSchema,
  rentalDays: countSchema,
  revenueVnd: signedVndSchema,
});

export const surchargeRowSchema = z.object({
  amountVnd: vndSchema,
  count: countSchema,
  kind: chargeKindSchema,
});

export const utilisationRowSchema = z.object({
  availableDays: countSchema,
  key: z.string(),
  label: z.string(),
  rentedDays: countSchema,
  utilisationPercent: percentSchema,
});

export const utilisationSchema = z.object({
  byType: z.array(utilisationRowSchema),
  byVehicle: z.array(utilisationRowSchema),
  fleet: utilisationRowSchema.pick({
    availableDays: true,
    rentedDays: true,
    utilisationPercent: true,
  }),
});

export const analyticsTotalsSchema = z.object({
  contractCount: countSchema,
  rentalDays: countSchema,
  revenueVnd: signedVndSchema,
  surchargeNetVnd: signedVndSchema,
  unallocatedVnd: signedVndSchema,
});

export const analyticsReportSchema = z.object({
  byMonth: z.array(monthRowSchema),
  byNationality: z.array(dimensionRowSchema),
  byType: z.array(dimensionRowSchema),
  byVehicle: z.array(dimensionRowSchema),
  from: daySchema,
  generatedAt: z.iso.datetime(),
  surcharges: z.array(surchargeRowSchema),
  timeZone: z.string(),
  to: daySchema,
  totals: analyticsTotalsSchema,
  utilisation: utilisationSchema,
});

export type DimensionRow = z.infer<typeof dimensionRowSchema>;
export type MonthRow = z.infer<typeof monthRowSchema>;
export type SurchargeRow = z.infer<typeof surchargeRowSchema>;
export type UtilisationRow = z.infer<typeof utilisationRowSchema>;
export type Utilisation = z.infer<typeof utilisationSchema>;
export type AnalyticsTotals = z.infer<typeof analyticsTotalsSchema>;
export type AnalyticsReport = z.infer<typeof analyticsReportSchema>;

// ---------------------------------------------------------------------------
// Profit and loss (US-029) and trends (US-030)
// ---------------------------------------------------------------------------

/** Parsed from query strings; both keys are optional and default to "twelve months up to now". */
export const pnlQuerySchema = z.object({
  months: z.coerce.number().int().min(1).max(MAX_TREND_MONTHS).default(DEFAULT_TREND_MONTHS),
  to: monthSchema.optional(),
});

export const pnlTotalsSchema = z.object({
  depreciationVnd: vndSchema,
  expensesVnd: signedVndSchema,
  profitVnd: signedVndSchema,
  revenueVnd: signedVndSchema,
});

export const pnlMonthSchema = pnlTotalsSchema.extend({ month: monthSchema });

export const pnlReportSchema = z.object({
  from: monthSchema,
  generatedAt: z.iso.datetime(),
  months: z.array(pnlMonthSchema),
  timeZone: z.string(),
  to: monthSchema,
  totals: pnlTotalsSchema,
});

export type PnlQuery = z.infer<typeof pnlQuerySchema>;
export type PnlTotals = z.infer<typeof pnlTotalsSchema>;
export type PnlMonth = z.infer<typeof pnlMonthSchema>;
export type PnlReport = z.infer<typeof pnlReportSchema>;

// ---------------------------------------------------------------------------
// Shared arithmetic (API and admin use the same functions)
// ---------------------------------------------------------------------------

/** `YYYY-MM` of a business day key. */
export function monthKey(day: string): string {
  return day.slice(0, MONTH_KEY_LENGTH);
}

function monthParts(month: string): { month: number; year: number } {
  const [year, monthOfYear] = month.split('-').map(Number);
  return { month: monthOfYear ?? 1, year: year ?? 0 };
}

function formatMonth(year: number, month: number): string {
  return `${String(year).padStart(YEAR_DIGITS, '0')}-${String(month).padStart(MONTH_DIGITS, '0')}`;
}

export function previousMonth(month: string): string {
  const parts = monthParts(month);
  return parts.month === 1
    ? formatMonth(parts.year - 1, MONTHS_PER_YEAR)
    : formatMonth(parts.year, parts.month - 1);
}

/** Last calendar day of the month as `YYYY-MM-DD` (UTC arithmetic: day 0 of the next month). */
export function monthEnd(month: string): string {
  const parts = monthParts(month);
  return new Date(Date.UTC(parts.year, parts.month, 0)).toISOString().slice(0, ISO_DATE_LENGTH);
}

/** `count` consecutive months ending with `to`, oldest first. */
export function monthsEnding(to: string, count: number): string[] {
  const months: string[] = [];
  let current = to;
  for (let index = 0; index < count; index += 1) {
    months.unshift(current);
    current = previousMonth(current);
  }
  return months;
}

/** Whole-percent share, floored so the rows never add up to more than 100. */
export function sharePercent(partVnd: number, totalVnd: number): number {
  if (totalVnd <= 0 || partVnd <= 0) return 0;
  return Math.min(PERCENT, Math.floor((partVnd * PERCENT) / totalVnd));
}

export function utilisationPercent(rentedDays: number, availableDays: number): number {
  if (availableDays <= 0) return 0;
  return Math.min(PERCENT, Math.floor((rentedDays * PERCENT) / availableDays));
}

// ---------------------------------------------------------------------------
// Export layouts (approved Vietnamese headings)
// ---------------------------------------------------------------------------

export const DIMENSION_COLUMNS = ['Doanh thu', 'Ngày thuê', 'Hợp đồng', 'Tỷ lệ (%)'] as const;

export const ANALYTICS_SHEETS = {
  month: { columns: ['Tháng', 'Doanh thu', 'Ngày thuê', 'Hợp đồng'], name: 'Tháng' },
  nationality: { columns: ['Quốc tịch', ...DIMENSION_COLUMNS], name: 'Quốc tịch' },
  surcharges: { columns: ['Loại phụ phí', 'Số lần', 'Số tiền'], name: 'Phụ phí' },
  type: { columns: ['Loại xe', ...DIMENSION_COLUMNS], name: 'Loại xe' },
  utilisation: {
    columns: ['Xe / Loại', 'Ngày thuê', 'Ngày có xe', 'Tỷ lệ (%)'],
    name: 'Sử dụng xe',
  },
  vehicle: { columns: ['Xe', ...DIMENSION_COLUMNS], name: 'Xe' },
} as const;

export const PNL_COLUMNS = ['Tháng', 'Doanh thu', 'Chi phí', 'Khấu hao', 'Lãi lỗ'] as const;
export const PNL_SHEET_NAME = 'Lãi lỗ';
