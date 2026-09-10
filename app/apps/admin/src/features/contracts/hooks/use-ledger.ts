import { useQuery } from '@tanstack/react-query';
import { fetchLedger } from '@/features/contracts/api/contracts-api';

/** Ledger rows and balance; disabled for cancelled contracts, which never carry money. */
export function useLedger(contractId: string, enabled: boolean) {
  return useQuery({
    enabled,
    queryFn: () => fetchLedger(contractId),
    queryKey: ['ledger', contractId],
  });
}
