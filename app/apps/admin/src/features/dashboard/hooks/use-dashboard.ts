import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { OperationsBoard } from '@rental/contracts';
import { fetchOperationsBoard } from '@/features/dashboard/api/operations-board-api';

const BOARD_REFRESH_MS = 60_000;

export function useDashboard(): UseQueryResult<OperationsBoard, Error> {
  return useQuery({
    queryFn: fetchOperationsBoard,
    queryKey: ['operations-board'],
    refetchInterval: BOARD_REFRESH_MS,
  });
}
