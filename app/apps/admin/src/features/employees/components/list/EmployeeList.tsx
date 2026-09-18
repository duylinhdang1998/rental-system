import type { Employee } from '@rental/contracts';
import { EmployeeCard } from '@/features/employees/components/list/EmployeeCard';
import { EmployeeTable } from '@/features/employees/components/list/EmployeeTable';
import type { EmployeePage } from '@/features/employees/hooks/use-employee-page';

interface EmployeeListProps {
  items: Employee[];
  page: EmployeePage;
}

/** Table on wide screens, cards on phones — the same accounts either way. */
export function EmployeeList({ items, page }: EmployeeListProps) {
  return (
    <>
      <EmployeeTable items={items} page={page} />
      <ul className="grid gap-3 sm:hidden">
        {items.map((employee) => (
          <EmployeeCard employee={employee} key={employee.id} page={page} />
        ))}
      </ul>
    </>
  );
}
