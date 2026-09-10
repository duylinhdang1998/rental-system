import { useQuery } from '@tanstack/react-query';
import { fetchSettlement } from '@/features/contracts/api/contracts-api';

/** Live statement (or the frozen snapshot once settled); disabled for statuses without figures. */
export function useSettlement(contractId: string, enabled: boolean) {
  return useQuery({
    enabled,
    queryFn: () => fetchSettlement(contractId),
    queryKey: ['settlement', contractId],
  });
}
