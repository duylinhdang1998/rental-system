import type { UseMutationResult } from '@tanstack/react-query';
import type { ContractCancelInput, RentalContract } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { LifecycleFormDialog } from '@/features/contracts/components/lifecycle/LifecycleFormDialog';
import { useLifecycleForm } from '@/features/contracts/hooks/use-lifecycle-form';
import { TextAreaField } from '@/shared/ui/TextAreaField';

interface CancelContractDialogProps {
  mutation: UseMutationResult<RentalContract, Error, ContractCancelInput>;
  onClose: () => void;
}

const MIN_REASON = 3;
const MAX_REASON = 240;
const COPY_KEYS = {
  description: 'contractCancelBody',
  save: 'contractCancelConfirm',
  title: 'contractCancel',
};

export function CancelContractDialog({ mutation, onClose }: CancelContractDialogProps) {
  const { t } = useTranslation();
  const form = useLifecycleForm({ reason: '' }, (values) => values, mutation, onClose);
  return (
    <LifecycleFormDialog
      copyKeys={COPY_KEYS}
      mutation={mutation}
      onClose={onClose}
      onSubmit={form.submit}
      saveVariant="destructive"
    >
      <TextAreaField
        data-dialog-autofocus=""
        id="contract-cancel-reason"
        label={t('contractCancelReason')}
        maxLength={MAX_REASON}
        minLength={MIN_REASON}
        onChange={(event) => form.change('reason', event.target.value)}
        required
        value={form.form.reason}
      />
    </LifecycleFormDialog>
  );
}
