import { recordPayment } from '@/features/contracts/api/contracts-api';
import { useContractMutation } from '@/features/contracts/hooks/use-contract-mutation';

/** Stand-alone payment mutation for screens outside the contract detail (receivable list). */
export function useRecordPayment(contractId: string) {
  return useContractMutation(contractId, recordPayment);
}
