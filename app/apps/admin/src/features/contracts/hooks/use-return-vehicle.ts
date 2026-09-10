import type { ContractReturnInput } from '@rental/contracts';
import { returnVehicle } from '@/features/contracts/api/contracts-api';
import { useContractMutation } from '@/features/contracts/hooks/use-contract-mutation';

export function useReturnVehicle(contractId: string, lineId: string) {
  return useContractMutation<ContractReturnInput>(contractId, (id, input) =>
    returnVehicle(id, lineId, input),
  );
}
