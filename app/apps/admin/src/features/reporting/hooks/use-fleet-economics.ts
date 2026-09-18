import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { FleetEconomicsReport } from '@rental/contracts';
import { fetchFleetEconomics } from '@/features/reporting/api/report-api';

/** One cache entry per day; invalidated by expense, acquisition and contract mutations. */
export function useFleetEconomics(
  asOf: string,
  enabled: boolean,
): UseQueryResult<FleetEconomicsReport, Error> {
  return useQuery({
    enabled,
    queryFn: () => fetchFleetEconomics(asOf),
    queryKey: ['fleet-economics', asOf],
  });
}
