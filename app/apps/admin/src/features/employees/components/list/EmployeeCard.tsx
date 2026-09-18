import { useTranslation } from 'react-i18next';
import type { Employee } from '@rental/contracts';
import { EmployeeActions } from '@/features/employees/components/list/EmployeeActions';
import { EmployeeStatusBadge } from '@/features/employees/components/list/EmployeeStatusBadge';
import type { EmployeePage } from '@/features/employees/hooks/use-employee-page';

interface EmployeeCardProps {
  employee: Employee;
  page: EmployeePage;
}

export function EmployeeCard({ employee, page }: EmployeeCardProps) {
  const { t } = useTranslation();
  const isSelf = employee.id === page.currentUserId;
  return (
    <li className="surface-card grid gap-3 p-4" data-employee={employee.username} data-mobile-card>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-lg font-extrabold text-ink">{employee.name}</p>
          <p className="text-sm text-ink-muted">
            {employee.username} · {t(`employeeRoles.${employee.role}`)}
            {isSelf ? ` · ${t('employeeSelf')}` : ''}
          </p>
        </div>
        <EmployeeStatusBadge active={employee.active} />
      </div>
      <EmployeeActions
        busy={page.status.isPending}
        employee={employee}
        isSelf={isSelf}
        onReset={() => page.openReset(employee)}
        onToggle={() => page.toggleActive(employee)}
      />
    </li>
  );
}
