import { useTranslation } from 'react-i18next';
import type { Employee } from '@rental/contracts';
import { TableCell } from '@/components/ui/table-cell';
import { TableRow } from '@/components/ui/table-row';
import { EmployeeActions } from '@/features/employees/components/list/EmployeeActions';
import { EmployeeStatusBadge } from '@/features/employees/components/list/EmployeeStatusBadge';
import type { EmployeePage } from '@/features/employees/hooks/use-employee-page';

interface EmployeeTableRowProps {
  employee: Employee;
  page: EmployeePage;
}

export function EmployeeTableRow({ employee, page }: EmployeeTableRowProps) {
  const { t } = useTranslation();
  const isSelf = employee.id === page.currentUserId;
  return (
    <TableRow data-employee={employee.username}>
      <TableCell className="font-extrabold">
        {employee.name}
        {isSelf ? <span className="ml-2 text-xs text-ink-muted">({t('employeeSelf')})</span> : null}
        <span className="block text-xs font-semibold text-ink-muted">{employee.username}</span>
      </TableCell>
      <TableCell>{t(`employeeRoles.${employee.role}`)}</TableCell>
      <TableCell>
        <EmployeeStatusBadge active={employee.active} />
      </TableCell>
      <TableCell>
        <EmployeeActions
          busy={page.status.isPending}
          employee={employee}
          isSelf={isSelf}
          onReset={() => page.openReset(employee)}
          onToggle={() => page.toggleActive(employee)}
        />
      </TableCell>
    </TableRow>
  );
}
