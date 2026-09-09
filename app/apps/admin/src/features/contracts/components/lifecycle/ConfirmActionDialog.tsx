import type { UseMutationResult } from '@tanstack/react-query';
import type { RentalContract } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { LifecycleDialogShell } from '@/features/contracts/components/lifecycle/LifecycleDialogShell';
import { MutationAlert } from '@/features/contracts/components/lifecycle/MutationAlert';
import { LoadingButton } from '@/shared/ui/LoadingButton';

interface ConfirmActionDialogProps {
  action: 'activate' | 'complete';
  mutation: UseMutationResult<RentalContract, Error, void>;
  onClose: () => void;
}

const COPY = {
  activate: {
    body: 'contractActivateBody',
    confirm: 'contractActivateConfirm',
    title: 'contractActivate',
  },
  complete: {
    body: 'contractCompleteBody',
    confirm: 'contractCompleteConfirm',
    title: 'contractComplete',
  },
};

export function ConfirmActionDialog({ action, mutation, onClose }: ConfirmActionDialogProps) {
  const { t } = useTranslation();
  const copy = COPY[action];
  return (
    <LifecycleDialogShell description={t(copy.body)} onClose={onClose} title={t(copy.title)}>
      <MutationAlert error={mutation.error} />
      <div className="flex flex-wrap justify-end gap-3">
        <Button onClick={onClose} type="button" variant="outline">
          {t('cancel')}
        </Button>
        <LoadingButton
          data-dialog-autofocus=""
          loading={mutation.isPending}
          onClick={() => mutation.mutate(undefined, { onSuccess: onClose })}
          type="button"
        >
          {t(copy.confirm)}
        </LoadingButton>
      </div>
    </LifecycleDialogShell>
  );
}
