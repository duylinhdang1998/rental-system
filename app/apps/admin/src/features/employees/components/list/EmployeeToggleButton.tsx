import { Lock, LockOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Employee } from '@rental/contracts';
import { Button } from '@/components/ui/button';

interface EmployeeToggleButtonProps {
  disabled: boolean;
  employee: Employee;
  onToggle: () => void;
}

export function EmployeeToggleButton({ disabled, employee, onToggle }: EmployeeToggleButtonProps) {
  const { t } = useTranslation();
  const label = t(employee.active ? 'employeeLock' : 'employeeUnlock');
  const Icon = employee.active ? Lock : LockOpen;
  return (
    <Button
      aria-label={`${label} ${employee.username}`}
      disabled={disabled}
      onClick={onToggle}
      size="sm"
      type="button"
      variant={employee.active ? 'destructive' : 'default'}
    >
      <Icon aria-hidden data-icon="inline-start" />
      {label}
    </Button>
  );
}
