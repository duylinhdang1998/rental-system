import type { FormEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LifecycleDialogShell } from '@/features/contracts/components/lifecycle/LifecycleDialogShell';
import { MutationAlert } from '@/features/contracts/components/lifecycle/MutationAlert';
import { FormActions } from '@/shared/ui/FormActions';
import type { ButtonVariant } from '@/shared/ui/LoadingButton';

interface LifecycleCopyKeys {
  description: string;
  save: string;
  title: string;
}

interface LifecycleFormDialogProps {
  children: ReactNode;
  copyKeys: LifecycleCopyKeys;
  mutation: { error: Error | null; isPending: boolean };
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  saveVariant?: ButtonVariant;
  submitDisabled?: boolean;
}

export function LifecycleFormDialog(props: LifecycleFormDialogProps) {
  const { t } = useTranslation();
  return (
    <LifecycleDialogShell
      description={t(props.copyKeys.description)}
      onClose={props.onClose}
      title={t(props.copyKeys.title)}
    >
      <form className="grid gap-4" onSubmit={props.onSubmit}>
        <MutationAlert error={props.mutation.error} />
        {props.children}
        <FormActions
          cancelLabel={t('contractBack')}
          disabled={props.submitDisabled}
          loading={props.mutation.isPending}
          onCancel={props.onClose}
          saveLabel={t(props.copyKeys.save)}
          saveVariant={props.saveVariant}
        />
      </form>
    </LifecycleDialogShell>
  );
}
