import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { PnlReport } from '@rental/contracts';
import { fetchPnl, type PnlQueryState } from '@/features/reporting/api/report-api';

/** One cache entry per month span; expense, acquisition and contract mutations invalidate it. */
export function usePnl(query: PnlQueryState, enabled: boolean): UseQueryResult<PnlReport, Error> {
  return useQuery({
    enabled,
    queryFn: () => fetchPnl(query),
    queryKey: ['pnl', query.to, query.months],
  });
}
