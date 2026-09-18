import { useTranslation } from 'react-i18next';
import { employeeTone } from '@/features/employees/lib/employee-presentation';
import { StatusBadge } from '@/shared/ui/StatusBadge';

interface EmployeeStatusBadgeProps {
  active: boolean;
}

export function EmployeeStatusBadge({ active }: EmployeeStatusBadgeProps) {
  const { t } = useTranslation();
  return (
    <StatusBadge
      label={t(active ? 'employeeStatusActive' : 'employeeStatusLocked')}
      tone={employeeTone(active)}
    />
  );
}
