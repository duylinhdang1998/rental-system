import {
  analyticsReportSchema,
  fleetEconomicsReportSchema,
  pnlReportSchema,
  revenueReportSchema,
  type AnalyticsReport,
  type FleetEconomicsReport,
  type PnlReport,
  type ReportRange,
  type RevenueReport,
} from '@rental/contracts';
import { apiRequest } from '@/shared/api/http';

function rangeQuery(range: ReportRange): string {
  return new URLSearchParams({ from: range.from, to: range.to }).toString();
}

/** BR-08: the API rejects Staff before any aggregate is computed; the UI only reaches it as Owner. */
export async function fetchRevenueReport(range: ReportRange): Promise<RevenueReport> {
  return revenueReportSchema.parse(await apiRequest(`/api/reports/revenue?${rangeQuery(range)}`));
}

/** Plain link target: the browser downloads the workbook with the session cookie attached. */
export function revenueExportUrl(range: ReportRange): string {
  return `/api/reports/revenue/export?${rangeQuery(range)}`;
}

function asOfQuery(asOf: string): string {
  return new URLSearchParams({ asOf }).toString();
}

/** Owner only at the API (BR-08); per-vehicle cost, revenue and break-even as of one day. */
export async function fetchFleetEconomics(asOf: string): Promise<FleetEconomicsReport> {
  return fleetEconomicsReportSchema.parse(
    await apiRequest(`/api/reports/fleet-economics?${asOfQuery(asOf)}`),
  );
}

export function fleetEconomicsExportUrl(asOf: string): string {
  return `/api/reports/fleet-economics/export?${asOfQuery(asOf)}`;
}

/** Owner only (BR-08): revenue by type, vehicle, nationality and month, surcharges, utilisation. */
export async function fetchAnalytics(range: ReportRange): Promise<AnalyticsReport> {
  return analyticsReportSchema.parse(
    await apiRequest(`/api/reports/analytics?${rangeQuery(range)}`),
  );
}

export function analyticsExportUrl(range: ReportRange): string {
  return `/api/reports/analytics/export?${rangeQuery(range)}`;
}

export interface PnlQueryState {
  months: string;
  to: string;
}

function pnlQuery(query: PnlQueryState): string {
  return new URLSearchParams({ months: query.months, to: query.to }).toString();
}

/** Owner only (BR-08): revenue − expenses − depreciation per month. */
export async function fetchPnl(query: PnlQueryState): Promise<PnlReport> {
  return pnlReportSchema.parse(await apiRequest(`/api/reports/pnl?${pnlQuery(query)}`));
}

export function pnlExportUrl(query: PnlQueryState): string {
  return `/api/reports/pnl/export?${pnlQuery(query)}`;
}
