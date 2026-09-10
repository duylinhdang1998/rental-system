import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { ReturnQueue } from '@rental/contracts';
import { fetchReturnQueue } from '@/features/returns/api/returns-api';

const QUEUE_REFRESH_MS = 60_000;

export function useReturnQueue(): UseQueryResult<ReturnQueue, Error> {
  return useQuery({
    queryFn: fetchReturnQueue,
    queryKey: ['return-queue'],
    refetchInterval: QUEUE_REFRESH_MS,
  });
}
