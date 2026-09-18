import { KeyRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Employee } from '@rental/contracts';
import { Button } from '@/components/ui/button';
import { EmployeeToggleButton } from '@/features/employees/components/list/EmployeeToggleButton';

interface EmployeeActionsProps {
  busy: boolean;
  employee: Employee;
  isSelf: boolean;
  onReset: () => void;
  onToggle: () => void;
}

/** The Owner cannot lock themselves (the API refuses too); resets stay available. */
export function EmployeeActions(props: EmployeeActionsProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap gap-2">
      <EmployeeToggleButton
        disabled={props.busy || props.isSelf}
        employee={props.employee}
        onToggle={props.onToggle}
      />
      <Button
        aria-label={`${t('employeeResetPassword')} ${props.employee.username}`}
        disabled={props.busy}
        onClick={props.onReset}
        size="sm"
        type="button"
        variant="outline"
      >
        <KeyRound aria-hidden data-icon="inline-start" />
        {t('employeeResetPassword')}
      </Button>
    </div>
  );
}
