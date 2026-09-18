import { useState, type FormEvent } from 'react';
import { useResetEmployeePassword } from '@/features/employees/hooks/use-employees';
import { passwordIssue } from '@/features/employees/lib/employee-presentation';

export function usePasswordResetForm(employeeId: string, onSaved: () => void) {
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const reset = useResetEmployeePassword();
  const issue = passwordIssue(password);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (issue) return;
    reset.mutate({ id: employeeId, password }, { onSuccess: () => onSaved() });
  };
  return { issue: touched ? issue : undefined, password, reset, setPassword, submit };
}

export type PasswordResetForm = ReturnType<typeof usePasswordResetForm>;
