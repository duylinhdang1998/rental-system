import {
  MAX_REPORT_DAYS,
  MILLISECONDS_PER_DAY,
  businessDayKey,
  type AgingBucket,
  type DailyRevenueRow,
  type EmployeeRevenueRow,
  type ReportContractRow,
  type ReportRange,
  type RevenueTotals,
} from '@rental/contracts';
import { formatCurrency, formatDate, formatDateTime, type Locale } from '@/shared/i18n/locale';

export type RangeIssue = 'invalid' | 'order' | 'span' | null;

/** Asia/Ho_Chi_Minh has no daylight saving, so a fixed offset is exact. */
const BUSINESS_OFFSET = '+07:00';
const MONTH_PREFIX_LENGTH = 7;
const PERCENT = 100;

function dayInstant(day: string): number {
  return Date.parse(`${day}T00:00:00${BUSINESS_OFFSET}`);
}

/** First day of the current business month up to today: what the Owner reconciles most. */
export function defaultReportRange(now: Date): ReportRange {
  const today = businessDayKey(now);
  return { from: `${today.slice(0, MONTH_PREFIX_LENGTH)}-01`, to: today };
}

/** Mirrors the API rule so the export link is never offered for a range the API rejects. */
export function rangeIssue(range: ReportRange, maxDays = MAX_REPORT_DAYS): RangeIssue {
  const from = dayInstant(range.from);
  const to = dayInstant(range.to);
  if (Number.isNaN(from) || Number.isNaN(to)) return 'invalid';
  if (to < from) return 'order';
  return Math.round((to - from) / MILLISECONDS_PER_DAY) >= maxDays ? 'span' : null;
}

/** Share of gross receipts (cash + transfer) for one method, as a whole percentage. */
export function collectionShare(totals: RevenueTotals, partVnd: number): number {
  const gross = totals.cashVnd + totals.transferVnd;
  return gross > 0 ? Math.round((partVnd / gross) * PERCENT) : 0;
}

export function maxDailyNet(days: readonly DailyRevenueRow[]): number {
  return Math.max(0, ...days.map((day) => day.netVnd));
}

export function agingLabelKey(bucket: AgingBucket): string {
  return `reportAgingBucket.${bucket}`;
}

export interface MoneyRowData {
  cash: string;
  key: string;
  label: string;
  net: string;
  netVnd: number;
  paymentCount: number;
  refund: string;
  transfer: string;
}

type MoneyRowSource = Omit<RevenueTotals, 'contractCount'>;

function moneyRow(key: string, label: string, row: MoneyRowSource, locale: Locale): MoneyRowData {
  return {
    cash: formatCurrency(row.cashVnd, locale),
    key,
    label,
    net: formatCurrency(row.netVnd, locale),
    netVnd: row.netVnd,
    paymentCount: row.paymentCount,
    refund: formatCurrency(row.refundVnd, locale),
    transfer: formatCurrency(row.transferVnd, locale),
  };
}

export function dailyMoneyRows(days: readonly DailyRevenueRow[], locale: Locale): MoneyRowData[] {
  return days.map((row) =>
    moneyRow(row.day, formatDate(new Date(dayInstant(row.day)), locale), row, locale),
  );
}

export function employeeMoneyRows(
  employees: readonly EmployeeRevenueRow[],
  locale: Locale,
): MoneyRowData[] {
  return employees.map((row) => moneyRow(row.employeeId, row.employeeName, row, locale));
}

/** The 14 approved columns in the client's order (FR-09). */
export const REPORT_COLUMN_KEYS = [
  'sequence',
  'customer',
  'contact',
  'time',
  'returnAt',
  'vehicles',
  'rentalDays',
  'unitPrice',
  'transfer',
  'cash',
  'depositOrDocument',
  'address',
  'employee',
  'notes',
] as const;

export type ReportColumnKey = (typeof REPORT_COLUMN_KEYS)[number];

export interface ContractCell {
  key: ReportColumnKey;
  value: string;
}

export function contractRowCells(row: ReportContractRow, locale: Locale): ContractCell[] {
  const values: Record<ReportColumnKey, string> = {
    address: row.address,
    cash: formatCurrency(row.cashVnd, locale),
    contact: row.contact,
    customer: row.customerName,
    depositOrDocument: row.depositOrDocument,
    employee: row.employeeName,
    notes: row.notes,
    rentalDays: String(row.rentalDays),
    returnAt: row.returnAt ? formatDate(new Date(row.returnAt), locale) : '',
    sequence: String(row.sequence),
    time: formatDateTime(row.time, locale),
    transfer: formatCurrency(row.transferVnd, locale),
    unitPrice: formatCurrency(row.unitPriceVnd, locale),
    vehicles: row.vehicleCodes.join(', '),
  };
  return REPORT_COLUMN_KEYS.map((key) => ({ key, value: values[key] }));
}
