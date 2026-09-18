import {
  DEFAULT_TREND_MONTHS,
  MONTH_PATTERN,
  businessDayKey,
  monthKey,
  type PnlMonth,
  type PnlTotals,
} from '@rental/contracts';
import type { PnlQueryState } from '@/features/reporting/api/report-api';
import { monthLabel, signedCurrency } from '@/features/reporting/lib/analytics-presentation';
import type { Locale } from '@/shared/i18n/locale';

export type PnlIssue = 'invalid' | null;

export const PNL_MONTH_OPTIONS = ['6', '12', '24'] as const;

export function defaultPnlQuery(now: Date): PnlQueryState {
  return { months: String(DEFAULT_TREND_MONTHS), to: monthKey(businessDayKey(now)) };
}

/** Mirrors the API schema: only a well-formed `YYYY-MM` and a listed month count are queried. */
export function pnlIssue(query: PnlQueryState): PnlIssue {
  if (!MONTH_PATTERN.test(query.to)) return 'invalid';
  return PNL_MONTH_OPTIONS.some((option) => option === query.months) ? null : 'invalid';
}

export function pnlMonthOptions(
  label: (count: number) => string,
): { label: string; value: string }[] {
  return PNL_MONTH_OPTIONS.map((option) => ({ label: label(Number(option)), value: option }));
}

export const PNL_COLUMN_KEYS = ['month', 'revenue', 'expenses', 'depreciation', 'profit'] as const;

export type PnlColumnKey = (typeof PNL_COLUMN_KEYS)[number];

export interface PnlCell {
  key: PnlColumnKey;
  value: string;
}

export function pnlRowCells(row: PnlMonth, locale: Locale): PnlCell[] {
  const values: Record<PnlColumnKey, string> = {
    depreciation: signedCurrency(row.depreciationVnd, locale),
    expenses: signedCurrency(row.expensesVnd, locale),
    month: monthLabel(row.month),
    profit: signedCurrency(row.profitVnd, locale),
    revenue: signedCurrency(row.revenueVnd, locale),
  };
  return PNL_COLUMN_KEYS.map((key) => ({ key, value: values[key] }));
}

export function pnlTotalCells(totals: PnlTotals, locale: Locale, label: string): PnlCell[] {
  return pnlRowCells({ ...totals, month: '' }, locale).map((cell) =>
    cell.key === 'month' ? { key: cell.key, value: label } : cell,
  );
}

export type PnlTotalKey = keyof PnlTotals;

export const PNL_TOTAL_KEYS: PnlTotalKey[] = [
  'revenueVnd',
  'expensesVnd',
  'depreciationVnd',
  'profitVnd',
];

export function pnlTotalCards(
  totals: PnlTotals,
  locale: Locale,
): { key: PnlTotalKey; value: string }[] {
  return PNL_TOTAL_KEYS.map((key) => ({ key, value: signedCurrency(totals[key], locale) }));
}

export const PNL_SERIES_KEYS = ['revenueVnd', 'expensesVnd', 'profitVnd'] as const;

export type PnlSeriesKey = (typeof PNL_SERIES_KEYS)[number];

/** Three lines in one chart: what came in, what went out and what is left. */
export function pnlSeries(rows: readonly PnlMonth[]): {
  labels: string[];
  series: { key: PnlSeriesKey; values: number[] }[];
} {
  return {
    labels: rows.map((row) => monthLabel(row.month)),
    series: PNL_SERIES_KEYS.map((key) => ({ key, values: rows.map((row) => row[key]) })),
  };
}
