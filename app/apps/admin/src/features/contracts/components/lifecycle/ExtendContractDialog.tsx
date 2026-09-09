import type { UseMutationResult } from '@tanstack/react-query';
import type { ContractExtendInput, RentalContract } from '@rental/contracts';
import {
  ExtendContractFields,
  type ExtendFormValues,
} from '@/features/contracts/components/lifecycle/ExtendContractFields';
import { LifecycleFormDialog } from '@/features/contracts/components/lifecycle/LifecycleFormDialog';
import { useLifecycleForm } from '@/features/contracts/hooks/use-lifecycle-form';
import {
  defaultExtensionEnd,
  localInputToIso,
} from '@/features/contracts/lib/contract-presentation';

interface ExtendContractDialogProps {
  contract: RentalContract;
  mutation: UseMutationResult<RentalContract, Error, ContractExtendInput>;
  onClose: () => void;
}

const COPY_KEYS = {
  description: 'contractExtendBody',
  save: 'contractExtendConfirm',
  title: 'contractExtend',
};

function toInput(form: ExtendFormValues): ContractExtendInput {
  return {
    newEndAt: localInputToIso(form.newEndLocal),
    ...(form.reason.trim() ? { reason: form.reason.trim() } : {}),
  };
}

export function ExtendContractDialog({ contract, mutation, onClose }: ExtendContractDialogProps) {
  const form = useLifecycleForm(
    { newEndLocal: defaultExtensionEnd(contract.quote.endAt), reason: '' },
    toInput,
    mutation,
    onClose,
  );
  return (
    <LifecycleFormDialog
      copyKeys={COPY_KEYS}
      mutation={mutation}
      onClose={onClose}
      onSubmit={form.submit}
    >
      <ExtendContractFields
        currentEndAt={contract.quote.endAt}
        onChange={form.change}
        values={form.form}
      />
    </LifecycleFormDialog>
  );
}
