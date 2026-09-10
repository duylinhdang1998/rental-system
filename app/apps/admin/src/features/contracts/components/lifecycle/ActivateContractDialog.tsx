import type { UseMutationResult } from '@tanstack/react-query';
import type { RentalContract } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { LifecycleDialogShell } from '@/features/contracts/components/lifecycle/LifecycleDialogShell';
import { MutationAlert } from '@/features/contracts/components/lifecycle/MutationAlert';
import { LoadingButton } from '@/shared/ui/LoadingButton';

interface ActivateContractDialogProps {
  mutation: UseMutationResult<RentalContract, Error, void>;
  onClose: () => void;
}

export function ActivateContractDialog({ mutation, onClose }: ActivateContractDialogProps) {
  const { t } = useTranslation();
  return (
    <LifecycleDialogShell
      description={t('contractActivateBody')}
      onClose={onClose}
      title={t('contractActivate')}
    >
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
          {t('contractActivateConfirm')}
        </LoadingButton>
      </div>
    </LifecycleDialogShell>
  );
}
