import {
  activateContract,
  addContractCharge,
  cancelContract,
  extendContract,
  recordPayment,
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
    payment: useContractMutation(id, recordPayment),
    settle: useContractMutation(id, settleContract),
    swap: useContractMutation(id, swapContract),
  };
}

export type ContractMutations = ReturnType<typeof useContractMutations>;
