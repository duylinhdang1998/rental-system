import { EmployeeCreateDialog } from '@/features/employees/components/form/EmployeeCreateDialog';
import { PasswordResetDialog } from '@/features/employees/components/form/PasswordResetDialog';
import { EmployeeHeader } from '@/features/employees/components/list/EmployeeHeader';
import { EmployeeList } from '@/features/employees/components/list/EmployeeList';
import { useEmployeePage } from '@/features/employees/hooks/use-employee-page';
import { ViewState } from '@/shared/ui/ViewState';
import { QueryRegion } from '@/shared/ui/QueryRegion';

const EMPTY_COPY = { description: 'employeeEmptyBody', title: 'employeeEmptyTitle' };

export function EmployeeListPage() {
  const page = useEmployeePage();
  const list = page.employees.data;
  return (
    <section className="grid gap-5">
      <EmployeeHeader count={list?.count ?? 0} onAdd={page.openCreate} />
      {page.status.isError ? (
        <p className="text-sm font-semibold text-negative" role="alert">
          {page.status.error.message}
        </p>
      ) : null}
      <QueryRegion query={page.employees}>
        {(data) =>
          data.items.length ? (
            <EmployeeList items={data.items} page={page} />
          ) : (
            <ViewState copy={EMPTY_COPY} heading="section" state="empty" />
          )
        }
      </QueryRegion>
      {page.dialog?.kind === 'create' ? <EmployeeCreateDialog onClose={page.close} /> : null}
      {page.dialog?.kind === 'reset' ? (
        <PasswordResetDialog employee={page.dialog.employee} onClose={page.close} />
      ) : null}
    </section>
  );
}
