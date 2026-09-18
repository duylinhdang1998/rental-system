import { useTranslation } from 'react-i18next';
import { EmployeeIdentityFields } from '@/features/employees/components/form/EmployeeIdentityFields';
import type { EmployeeForm } from '@/features/employees/hooks/use-employee-form';
import { PASSWORD_HELP_LENGTH } from '@/features/employees/lib/employee-presentation';
import { TextField } from '@/shared/ui/TextField';

interface EmployeeFieldsProps {
  form: EmployeeForm;
}

export function EmployeeFields({ form }: EmployeeFieldsProps) {
  const { t } = useTranslation();
  const issue = form.issues.password;
  return (
    <div className="grid gap-4">
      <EmployeeIdentityFields form={form} />
      <TextField
        autoComplete="new-password"
        error={issue ? t(issue, { count: PASSWORD_HELP_LENGTH }) : undefined}
        id="employee-password"
        label={t('employeePassword')}
        onChange={(event) => form.change('password', event.target.value)}
        type="password"
        value={form.fields.password}
      />
      <p className="-mt-2 text-xs text-ink-muted">
        {t('employeePasswordHelp', { count: PASSWORD_HELP_LENGTH })}
      </p>
    </div>
  );
}
