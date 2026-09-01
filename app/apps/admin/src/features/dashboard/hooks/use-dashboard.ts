import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { DemoDashboard } from '@rental/contracts';
import { fetchDashboard } from '@/shared/api/demo-api';

export function useDashboard(): UseQueryResult<DemoDashboard, Error> {
  return useQuery({ queryFn: fetchDashboard, queryKey: ['demo-dashboard'] });
}
