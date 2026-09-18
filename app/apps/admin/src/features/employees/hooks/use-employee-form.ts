import { useState, type FormEvent } from 'react';
import { useCreateEmployee } from '@/features/employees/hooks/use-employees';
import { employeeFieldIssues } from '@/features/employees/lib/employee-presentation';

export interface EmployeeFields {
  name: string;
  password: string;
  username: string;
}

const EMPTY_FIELDS: EmployeeFields = { name: '', password: '', username: '' };

export function useEmployeeForm(onCreated: () => void) {
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [touched, setTouched] = useState(false);
  const create = useCreateEmployee();
  const issues = employeeFieldIssues(fields);
  const change = (field: keyof EmployeeFields, value: string) =>
    setFields((current) => ({ ...current, [field]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (Object.keys(issues).length > 0) return;
    create.mutate(
      { name: fields.name, password: fields.password, role: 'STAFF', username: fields.username },
      { onSuccess: () => onCreated() },
    );
  };
  return { change, create, fields, issues: touched ? issues : {}, submit };
}

export type EmployeeForm = ReturnType<typeof useEmployeeForm>;
