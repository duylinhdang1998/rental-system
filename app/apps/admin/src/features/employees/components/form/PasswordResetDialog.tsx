import { useTranslation } from 'react-i18next';
import type { Employee } from '@rental/contracts';
import { EmployeeDialogShell } from '@/features/employees/components/form/EmployeeDialogShell';
import { PasswordResetForm } from '@/features/employees/components/form/PasswordResetForm';

interface PasswordResetDialogProps {
  employee: Employee;
  onClose: () => void;
}

export function PasswordResetDialog({ employee, onClose }: PasswordResetDialogProps) {
  const { t } = useTranslation();
  return (
    <EmployeeDialogShell
      description={t('employeeResetBody')}
      onClose={onClose}
      title={t('employeeResetTitle', { name: employee.name })}
    >
      <PasswordResetForm employeeId={employee.id} onClose={onClose} />
    </EmployeeDialogShell>
  );
}
