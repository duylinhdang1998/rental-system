import type { LifecycleDialogsProps } from '@/features/contracts/components/lifecycle/LifecycleDialogs';
import { ReturnVehicleDialog } from '@/features/contracts/components/returns/ReturnVehicleDialog';
import { AddChargeDialog } from '@/features/contracts/components/settlement/AddChargeDialog';
import { SettleContractDialog } from '@/features/contracts/components/settlement/SettleContractDialog';

/** Sprint 5 dialogs: per-line return, manual charge and the final settlement. */
export function SettlementDialogs(props: LifecycleDialogsProps) {
  const { contract, dialog, isOwner, mutations, onClose, statement } = props;
  switch (dialog?.kind) {
    case 'charge':
      return (
        <AddChargeDialog
          contract={contract}
          isOwner={isOwner}
          mutation={mutations.charge}
          onClose={onClose}
        />
      );
    case 'return':
      return (
        <ReturnVehicleDialog contractId={contract.id} onClose={onClose} target={dialog.target} />
      );
    case 'settle':
      return statement ? (
        <SettleContractDialog
          contract={contract}
          mutation={mutations.settle}
          onClose={onClose}
          statement={statement}
        />
      ) : null;
    default:
      return null;
  }
}
