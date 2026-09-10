import type { ContractLedger, RentalContract, SettlementStatement } from '@rental/contracts';
import { ActivateContractDialog } from '@/features/contracts/components/lifecycle/ActivateContractDialog';
import { CancelContractDialog } from '@/features/contracts/components/lifecycle/CancelContractDialog';
import { ExtendContractDialog } from '@/features/contracts/components/lifecycle/ExtendContractDialog';
import { SwapVehicleDialog } from '@/features/contracts/components/lifecycle/SwapVehicleDialog';
import { PaymentDialog } from '@/features/contracts/components/payments/PaymentDialog';
import { SettlementDialogs } from '@/features/contracts/components/settlement/SettlementDialogs';
import type { DetailDialog } from '@/features/contracts/hooks/use-contract-detail-page';
import type { ContractMutations } from '@/features/contracts/hooks/use-contract-mutations';

export interface LifecycleDialogsProps {
  contract: RentalContract;
  dialog: DetailDialog | null;
  isOwner: boolean;
  ledger: ContractLedger | undefined;
  mutations: ContractMutations;
  onClose: () => void;
  statement: SettlementStatement | undefined;
}

export function LifecycleDialogs(props: LifecycleDialogsProps) {
  const { contract, dialog, ledger, mutations, onClose } = props;
  switch (dialog?.kind) {
    case 'activate':
      return <ActivateContractDialog mutation={mutations.activate} onClose={onClose} />;
    case 'cancel':
      return <CancelContractDialog mutation={mutations.cancel} onClose={onClose} />;
    case 'extend':
      return (
        <ExtendContractDialog contract={contract} mutation={mutations.extend} onClose={onClose} />
      );
    case 'swap':
      return <SwapVehicleDialog contract={contract} mutation={mutations.swap} onClose={onClose} />;
    case 'payment':
      return ledger ? (
        <PaymentDialog balance={ledger.balance} mutation={mutations.payment} onClose={onClose} />
      ) : null;
    default:
      return <SettlementDialogs {...props} />;
  }
}
