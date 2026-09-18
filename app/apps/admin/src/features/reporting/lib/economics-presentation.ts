import {
  businessDayKey,
  type BreakEven,
  type BreakEvenStatus,
  type FleetEconomicsRow,
  type FleetEconomicsTotals,
} from '@rental/contracts';
import { formatCurrency, formatDate, type Locale } from '@/shared/i18n/locale';

export type AsOfIssue = 'invalid' | null;
export type BreakEvenTone = 'info' | 'neutral' | 'success' | 'warning';

export interface EconomicsCell {
  key: EconomicsColumnKey;
  value: string;
}

export type EconomicsTotalKey = 'bookValueVnd' | 'expensesVnd' | 'netVnd' | 'revenueVnd';

export interface EconomicsTotalCard {
  contextKey: string;
  contextParams: Record<string, string | number>;
  key: EconomicsTotalKey;
  value: string;
}

/** Asia/Ho_Chi_Minh has no daylight saving, so a fixed offset is exact. */
const BUSINESS_OFFSET = '+07:00';
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const ECONOMICS_COLUMN_KEYS = [
  'vehicle',
  'purchasePrice',
  'monthlyDepreciation',
  'bookValue',
  'revenue',
  'rentalDays',
  'expenses',
  'net',
  'recovered',
  'breakEven',
] as const;

export type EconomicsColumnKey = (typeof ECONOMICS_COLUMN_KEYS)[number];

const TONES: Record<BreakEvenStatus, BreakEvenTone> = {
  NO_COST: 'neutral',
  NOT_PROJECTABLE: 'warning',
  PROJECTED: 'info',
  RECOVERED: 'success',
};

const TOTAL_CARD_KEYS: EconomicsTotalKey[] = [
  'revenueVnd',
  'expensesVnd',
  'netVnd',
  'bookValueVnd',
];

export function defaultAsOf(now: Date): string {
  return businessDayKey(now);
}

/** Mirrors the API rule: only a well-formed calendar day is queried or exported. */
export function asOfIssue(asOf: string): AsOfIssue {
  if (!DATE_PATTERN.test(asOf)) return 'invalid';
  return Number.isNaN(Date.parse(`${asOf}T00:00:00${BUSINESS_OFFSET}`)) ? 'invalid' : null;
}

export function formatBusinessDay(day: string, locale: Locale): string {
  return formatDate(new Date(`${day}T00:00:00${BUSINESS_OFFSET}`), locale);
}

export function breakEvenTone(status: BreakEvenStatus): BreakEvenTone {
  return TONES[status];
}

/** The badge copy: the projected day is part of the label, not a separate column, on phones. */
export function breakEvenLabel(
  breakEven: BreakEven,
  locale: Locale,
  t: (key: string, options?: Record<string, unknown>) => string,
): string {
  if (breakEven.status === 'PROJECTED' && breakEven.projectedOn) {
    return t('breakEven.PROJECTED', {
      day: formatBusinessDay(breakEven.projectedOn, locale),
      months: breakEven.monthsRemaining ?? 0,
    });
  }
  return t(`breakEven.${breakEven.status}`);
}

export function economicsRowCells(
  row: FleetEconomicsRow,
  locale: Locale,
  breakEven: string,
): EconomicsCell[] {
  const money = (value: number) => formatCurrency(value, locale);
  const values: Record<EconomicsColumnKey, string> = {
    bookValue: money(row.bookValueVnd),
    breakEven,
    expenses: money(row.expensesVnd),
    monthlyDepreciation: money(row.monthlyDepreciationVnd),
    net: money(row.netVnd),
    purchasePrice: row.acquisition ? money(row.purchasePriceVnd) : '—',
    recovered: row.acquisition ? `${row.recoveredPercent}%` : '—',
    rentalDays: String(row.rentalDays),
    revenue: money(row.revenueVnd),
    vehicle: `${row.code} · ${row.plate}`,
  };
  return ECONOMICS_COLUMN_KEYS.map((key) => ({ key, value: values[key] }));
}

function totalContext(
  key: EconomicsTotalKey,
  totals: FleetEconomicsTotals,
  locale: Locale,
): Pick<EconomicsTotalCard, 'contextKey' | 'contextParams'> {
  if (key === 'netVnd') return { contextKey: 'economicsKpi.netVnd', contextParams: {} };
  if (key === 'bookValueVnd') {
    return {
      contextKey: 'economicsKpiCount',
      contextParams: { count: totals.vehicleCount, recovered: totals.vehiclesRecovered },
    };
  }
  const unallocated =
    key === 'revenueVnd' ? totals.unallocatedRevenueVnd : totals.unallocatedExpensesVnd;
  return {
    contextKey: 'economicsKpiUnallocated',
    contextParams: { amount: formatCurrency(unallocated, locale) },
  };
}

/** Four KPI cards with the unallocated buckets as context, so nothing is silently dropped. */
export function economicsTotalCards(
  totals: FleetEconomicsTotals,
  locale: Locale,
): EconomicsTotalCard[] {
  return TOTAL_CARD_KEYS.map((key) => ({
    ...totalContext(key, totals, locale),
    key,
    value: formatCurrency(totals[key], locale),
  }));
}

/** Card layout: every figure except the two the card header already shows. */
export function economicsCardCells(row: FleetEconomicsRow, locale: Locale): EconomicsCell[] {
  return economicsRowCells(row, locale, '').filter(
    (cell) => cell.key !== 'vehicle' && cell.key !== 'breakEven',
  );
}

/** Rows with a cost basis first, then the highest net at the top: what the Owner scans for. */
export function sortedEconomicsRows(rows: readonly FleetEconomicsRow[]): FleetEconomicsRow[] {
  return [...rows].sort((left, right) => {
    if (Boolean(left.acquisition) !== Boolean(right.acquisition)) return left.acquisition ? -1 : 1;
    return right.netVnd - left.netVnd || left.code.localeCompare(right.code);
  });
}
