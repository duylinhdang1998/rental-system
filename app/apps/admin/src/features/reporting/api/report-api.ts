import { revenueReportSchema, type ReportRange, type RevenueReport } from '@rental/contracts';
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
