import {
  MAX_ANALYTICS_DAYS,
  UNALLOCATED_KEY,
  businessDayKey,
  type AnalyticsTotals,
  type DimensionRow,
  type MonthRow,
  type ReportRange,
  type SurchargeRow,
  type Utilisation,
  type UtilisationRow,
} from '@rental/contracts';
import { rangeIssue, type RangeIssue } from '@/features/reporting/lib/report-presentation';
import { formatCurrency, type Locale } from '@/shared/i18n/locale';

const MONTH_LENGTH = 7;
const DAY_LENGTH = 10;
const TREND_MONTHS = 12;
const MONTH_INDEX_OFFSET = 1;

/** Twelve business months ending today: the first day of the month eleven months back up to today. */
export function defaultAnalyticsRange(now: Date): ReportRange {
  const today = businessDayKey(now);
  const [year, month] = today.slice(0, MONTH_LENGTH).split('-').map(Number);
  const start = new Date(
    Date.UTC(year ?? 0, (month ?? 1) - MONTH_INDEX_OFFSET - (TREND_MONTHS - 1), 1),
  );
  return { from: start.toISOString().slice(0, DAY_LENGTH), to: today };
}

export function analyticsRangeIssue(range: ReportRange): RangeIssue {
  return rangeIssue(range, MAX_ANALYTICS_DAYS);
}

/** `MM/YYYY`, the way the shop writes months. */
export function monthLabel(month: string): string {
  const [year, monthOfYear] = month.split('-');
  return `${monthOfYear ?? ''}/${year ?? ''}`;
}

/** A true minus sign (U+2212), never a hyphen, in front of negative money. */
export function signedCurrency(value: number, locale: Locale): string {
  return value < 0 ? `−${formatCurrency(-value, locale)}` : formatCurrency(value, locale);
}

export interface DimensionCells {
  contracts: string;
  key: string;
  label: string;
  rentalDays: string;
  revenue: string;
  share: number;
  unallocated: boolean;
}

export function dimensionCells(
  row: DimensionRow,
  locale: Locale,
  unallocatedLabel: string,
): DimensionCells {
  const unallocated = row.key === UNALLOCATED_KEY;
  return {
    contracts: String(row.contractCount),
    key: row.key,
    label: unallocated ? unallocatedLabel : row.label,
    rentalDays: unallocated ? '—' : String(row.rentalDays),
    revenue: signedCurrency(row.revenueVnd, locale),
    share: row.sharePercent,
    unallocated,
  };
}

export interface MonthCells {
  contracts: string;
  key: string;
  month: string;
  rentalDays: string;
  revenue: string;
}

export function monthCells(row: MonthRow, locale: Locale): MonthCells {
  return {
    contracts: String(row.contractCount),
    key: row.month,
    month: monthLabel(row.month),
    rentalDays: String(row.rentalDays),
    revenue: signedCurrency(row.revenueVnd, locale),
  };
}

export interface SurchargeCells {
  amount: string;
  count: string;
  kind: SurchargeRow['kind'];
}

export function surchargeCells(row: SurchargeRow, locale: Locale): SurchargeCells {
  return {
    amount: formatCurrency(row.amountVnd, locale),
    count: String(row.count),
    kind: row.kind,
  };
}

export interface UtilisationCells {
  days: string;
  key: string;
  label: string;
  percent: number;
}

export function utilisationCells(row: UtilisationRow): UtilisationCells {
  return {
    days: `${row.rentedDays}/${row.availableDays}`,
    key: row.key,
    label: row.label,
    percent: row.utilisationPercent,
  };
}

/** Vehicles, then their types, then the whole fleet; the two summary levels are emphasised. */
export function utilisationTableRows(
  utilisation: Utilisation,
  fleetLabel: string,
): (UtilisationCells & { emphasis: boolean })[] {
  const fleet = { ...utilisation.fleet, key: 'fleet', label: fleetLabel };
  return [
    ...utilisation.byVehicle.map((row) => ({ ...utilisationCells(row), emphasis: false })),
    ...utilisation.byType.map((row) => ({ ...utilisationCells(row), emphasis: true })),
    { ...utilisationCells(fleet), emphasis: true },
  ];
}

export type AnalyticsTotalKey = keyof AnalyticsTotals;

export interface AnalyticsTotalCard {
  contextParams: Record<string, string | number>;
  key: Exclude<AnalyticsTotalKey, 'contractCount'>;
  value: string;
}

const TOTAL_CARD_KEYS: AnalyticsTotalCard['key'][] = [
  'revenueVnd',
  'rentalDays',
  'surchargeNetVnd',
  'unallocatedVnd',
];

/** Four KPI cards; the contract count rides along as the revenue card's context. */
export function analyticsTotalCards(totals: AnalyticsTotals, locale: Locale): AnalyticsTotalCard[] {
  return TOTAL_CARD_KEYS.map((key) => ({
    contextParams: { count: totals.contractCount },
    key,
    value: key === 'rentalDays' ? String(totals.rentalDays) : signedCurrency(totals[key], locale),
  }));
}

/** The chart input for the month section: labels and one revenue series. */
export function monthSeries(rows: readonly MonthRow[]): {
  labels: string[];
  values: number[];
} {
  return {
    labels: rows.map((row) => monthLabel(row.month)),
    values: rows.map((row) => row.revenueVnd),
  };
}
