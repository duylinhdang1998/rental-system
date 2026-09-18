import { useTranslation } from 'react-i18next';
import type { EmployeeForm } from '@/features/employees/hooks/use-employee-form';
import { TextField } from '@/shared/ui/TextField';

interface EmployeeIdentityFieldsProps {
  form: EmployeeForm;
}

export function EmployeeIdentityFields({ form }: EmployeeIdentityFieldsProps) {
  const { t } = useTranslation();
  const issue = (key?: string) => (key ? t(key) : undefined);
  return (
    <>
      <TextField
        autoComplete="off"
        data-dialog-autofocus
        error={issue(form.issues.name)}
        id="employee-name"
        label={t('employeeName')}
        onChange={(event) => form.change('name', event.target.value)}
        value={form.fields.name}
      />
      <TextField
        autoCapitalize="none"
        autoComplete="off"
        error={issue(form.issues.username)}
        id="employee-username"
        label={t('employeeUsername')}
        onChange={(event) => form.change('username', event.target.value)}
        value={form.fields.username}
      />
      <p className="-mt-2 text-xs text-ink-muted">{t('employeeUsernameHelp')}</p>
    </>
  );
}
