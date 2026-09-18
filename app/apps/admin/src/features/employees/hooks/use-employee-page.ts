import { useState } from 'react';
import type { Employee } from '@rental/contracts';
import { useSession } from '@/features/auth/hooks/use-session';
import { useEmployeeStatus, useEmployees } from '@/features/employees/hooks/use-employees';

export type EmployeeDialog = { kind: 'create' } | { employee: Employee; kind: 'reset' };

export function useEmployeePage() {
  const employees = useEmployees();
  const status = useEmployeeStatus();
  const { user } = useSession();
  const [dialog, setDialog] = useState<EmployeeDialog | null>(null);
  return {
    close: () => setDialog(null),
    currentUserId: user?.id ?? '',
    dialog,
    employees,
    openCreate: () => setDialog({ kind: 'create' }),
    openReset: (employee: Employee) => setDialog({ employee, kind: 'reset' }),
    status,
    toggleActive: (employee: Employee) =>
      status.mutate({ active: !employee.active, id: employee.id }),
  };
}

export type EmployeePage = ReturnType<typeof useEmployeePage>;
