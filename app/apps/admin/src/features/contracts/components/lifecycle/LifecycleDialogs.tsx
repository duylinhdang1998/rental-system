import type { RentalContract } from '@rental/contracts';
import { CancelContractDialog } from '@/features/contracts/components/lifecycle/CancelContractDialog';
import { ConfirmActionDialog } from '@/features/contracts/components/lifecycle/ConfirmActionDialog';
import { ExtendContractDialog } from '@/features/contracts/components/lifecycle/ExtendContractDialog';
import { SwapVehicleDialog } from '@/features/contracts/components/lifecycle/SwapVehicleDialog';
import type { ContractMutations } from '@/features/contracts/hooks/use-contract-detail-page';
import type { ContractAction } from '@/features/contracts/lib/contract-presentation';

interface LifecycleDialogsProps {
  contract: RentalContract;
  dialog: ContractAction | null;
  mutations: ContractMutations;
  onClose: () => void;
}

export function LifecycleDialogs({ contract, dialog, mutations, onClose }: LifecycleDialogsProps) {
  if (dialog === 'activate' || dialog === 'complete') {
    return <ConfirmActionDialog action={dialog} mutation={mutations[dialog]} onClose={onClose} />;
  }
  if (dialog === 'cancel') {
    return <CancelContractDialog mutation={mutations.cancel} onClose={onClose} />;
  }
  if (dialog === 'extend') {
    return (
      <ExtendContractDialog contract={contract} mutation={mutations.extend} onClose={onClose} />
    );
  }
  if (dialog === 'swap') {
    return <SwapVehicleDialog contract={contract} mutation={mutations.swap} onClose={onClose} />;
  }
  return null;
}
