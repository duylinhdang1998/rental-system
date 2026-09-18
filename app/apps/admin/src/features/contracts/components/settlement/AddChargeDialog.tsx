import type { UseMutationResult } from '@tanstack/react-query';
import type { ContractChargeInput, RentalContract } from '@rental/contracts';
import { LifecycleFormDialog } from '@/features/contracts/components/lifecycle/LifecycleFormDialog';
import { ChargeAmountFields } from '@/features/contracts/components/settlement/ChargeAmountFields';
import { ChargeFields } from '@/features/contracts/components/settlement/ChargeFields';
import { useLifecycleForm } from '@/features/contracts/hooks/use-lifecycle-form';
import { activeContractLines } from '@/features/contracts/lib/contract-presentation';
import {
  INITIAL_CHARGE_FORM,
  chargeKinds,
  toChargeInput,
} from '@/features/contracts/lib/settlement-presentation';

interface AddChargeDialogProps {
  contract: RentalContract;
  isOwner: boolean;
  mutation: UseMutationResult<RentalContract, Error, ContractChargeInput>;
  onClose: () => void;
}

const COPY_KEYS = { description: 'chargeAddBody', save: 'chargeAddConfirm', title: 'chargeAdd' };

export function AddChargeDialog({ contract, isOwner, mutation, onClose }: AddChargeDialogProps) {
  const form = useLifecycleForm(INITIAL_CHARGE_FORM, toChargeInput, mutation, onClose);
  return (
    <LifecycleFormDialog
      copyKeys={COPY_KEYS}
      mutation={mutation}
      onClose={onClose}
      onSubmit={form.submit}
    >
      <ChargeFields
        kinds={chargeKinds(isOwner)}
        lines={activeContractLines(contract.quote.lines)}
        onChange={form.change}
        values={form.form}
      />
      <ChargeAmountFields onChange={form.change} values={form.form} />
    </LifecycleFormDialog>
  );
}
