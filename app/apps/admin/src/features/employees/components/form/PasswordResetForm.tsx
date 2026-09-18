import { useTranslation } from 'react-i18next';
import { usePasswordResetForm } from '@/features/employees/hooks/use-password-reset-form';
import { PASSWORD_HELP_LENGTH } from '@/features/employees/lib/employee-presentation';
import { FormActions } from '@/shared/ui/FormActions';
import { TextField } from '@/shared/ui/TextField';

interface PasswordResetFormProps {
  employeeId: string;
  onClose: () => void;
}

export function PasswordResetForm({ employeeId, onClose }: PasswordResetFormProps) {
  const { t } = useTranslation();
  const form = usePasswordResetForm(employeeId, onClose);
  return (
    <form className="grid gap-5" noValidate onSubmit={form.submit}>
      <TextField
        autoComplete="new-password"
        data-dialog-autofocus
        error={form.issue ? t(form.issue, { count: PASSWORD_HELP_LENGTH }) : undefined}
        id="employee-new-password"
        label={t('employeePassword')}
        onChange={(event) => form.setPassword(event.target.value)}
        type="password"
        value={form.password}
      />
      {form.reset.isError ? (
        <p className="text-sm font-semibold text-negative" role="alert">
          {form.reset.error.message}
        </p>
      ) : null}
      <FormActions
        cancelLabel={t('cancel')}
        loading={form.reset.isPending}
        onCancel={onClose}
        saveLabel={t('employeeSaveReset')}
      />
    </form>
  );
}
