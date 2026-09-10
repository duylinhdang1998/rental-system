import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { ReportRange, RevenueReport } from '@rental/contracts';
import { fetchRevenueReport } from '@/features/reporting/api/report-api';

/** One cache entry per range; invalidated by every contract mutation that moves money. */
export function useRevenueReport(
  range: ReportRange,
  enabled: boolean,
): UseQueryResult<RevenueReport, Error> {
  return useQuery({
    enabled,
    queryFn: () => fetchRevenueReport(range),
    queryKey: ['revenue-report', range],
  });
}
