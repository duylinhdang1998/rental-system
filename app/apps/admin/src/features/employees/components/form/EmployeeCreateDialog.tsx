import { useTranslation } from 'react-i18next';
import { EmployeeCreateForm } from '@/features/employees/components/form/EmployeeCreateForm';
import { EmployeeDialogShell } from '@/features/employees/components/form/EmployeeDialogShell';

interface EmployeeCreateDialogProps {
  onClose: () => void;
}

export function EmployeeCreateDialog({ onClose }: EmployeeCreateDialogProps) {
  const { t } = useTranslation();
  return (
    <EmployeeDialogShell
      description={t('employeeCreateBody')}
      onClose={onClose}
      title={t('employeeCreateTitle')}
    >
      <EmployeeCreateForm onClose={onClose} />
    </EmployeeDialogShell>
  );
}
