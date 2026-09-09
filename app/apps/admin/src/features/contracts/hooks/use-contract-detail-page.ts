import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  activateContract,
  cancelContract,
  completeContract,
  extendContract,
  swapContract,
} from '@/features/contracts/api/contracts-api';
import { useContract } from '@/features/contracts/hooks/use-contracts';
import { useContractMutation } from '@/features/contracts/hooks/use-contract-mutation';
import type { ContractAction } from '@/features/contracts/lib/contract-presentation';

export function useContractDetailPage() {
  const { id = '' } = useParams();
  const contract = useContract(id);
  const [dialog, setDialog] = useState<ContractAction | null>(null);
  const mutations = {
    activate: useContractMutation<void>(id, (contractId) => activateContract(contractId)),
    cancel: useContractMutation(id, cancelContract),
    complete: useContractMutation<void>(id, (contractId) => completeContract(contractId)),
    extend: useContractMutation(id, extendContract),
    swap: useContractMutation(id, swapContract),
  };
  const closeDialog = () => {
    Object.values(mutations).forEach((mutation) => mutation.reset());
    setDialog(null);
  };
  return { closeDialog, contract, dialog, mutations, openDialog: setDialog };
}

export type ContractMutations = ReturnType<typeof useContractDetailPage>['mutations'];
