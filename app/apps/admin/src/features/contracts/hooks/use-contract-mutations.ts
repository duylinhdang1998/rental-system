import {
  activateContract,
  addContractCharge,
  cancelContract,
  extendContract,
  settleContract,
  swapContract,
} from '@/features/contracts/api/contracts-api';
import { useContractMutation } from '@/features/contracts/hooks/use-contract-mutation';

export function useContractMutations(id: string) {
  return {
    activate: useContractMutation<void>(id, (contractId) => activateContract(contractId)),
    cancel: useContractMutation(id, cancelContract),
    charge: useContractMutation(id, addContractCharge),
    extend: useContractMutation(id, extendContract),
    settle: useContractMutation(id, settleContract),
    swap: useContractMutation(id, swapContract),
  };
}

export type ContractMutations = ReturnType<typeof useContractMutations>;
