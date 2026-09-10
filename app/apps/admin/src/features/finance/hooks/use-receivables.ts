import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { ReceivableList } from '@rental/contracts';
import { fetchReceivables } from '@/features/finance/api/finance-api';

const REFRESH_MS = 60_000;

export function useReceivables(): UseQueryResult<ReceivableList, Error> {
  return useQuery({
    queryFn: fetchReceivables,
    queryKey: ['receivables'],
    refetchInterval: REFRESH_MS,
  });
}
