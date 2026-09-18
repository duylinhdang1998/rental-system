import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { AnalyticsReport, ReportRange } from '@rental/contracts';
import { fetchAnalytics } from '@/features/reporting/api/report-api';

/** One cache entry per range; contract, charge and payment mutations invalidate it. */
export function useAnalytics(
  range: ReportRange,
  enabled: boolean,
): UseQueryResult<AnalyticsReport, Error> {
  return useQuery({
    enabled,
    queryFn: () => fetchAnalytics(range),
    queryKey: ['analytics', range.from, range.to],
  });
}
