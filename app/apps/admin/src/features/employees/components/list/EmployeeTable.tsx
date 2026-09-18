import { useTranslation } from 'react-i18next';
import type { Employee } from '@rental/contracts';
import { TableBody } from '@/components/ui/table-body';
import { TableHead } from '@/components/ui/table-head';
import { TableHeader } from '@/components/ui/table-header';
import { Table } from '@/components/ui/table-root';
import { TableRow } from '@/components/ui/table-row';
import { EmployeeTableRow } from '@/features/employees/components/list/EmployeeTableRow';
import type { EmployeePage } from '@/features/employees/hooks/use-employee-page';

interface EmployeeTableProps {
  items: Employee[];
  page: EmployeePage;
}

export function EmployeeTable({ items, page }: EmployeeTableProps) {
  const { t } = useTranslation();
  return (
    <div className="surface-card hidden overflow-hidden sm:block">
      <Table>
        <TableHeader className="bg-panel-subtle text-sm text-ink-muted">
          <TableRow>
            <TableHead>{t('employeeName')}</TableHead>
            <TableHead>{t('employeeRole')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead>
              <span className="sr-only">{t('employeeActions')}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((employee) => (
            <EmployeeTableRow employee={employee} key={employee.id} page={page} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
