import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateEmployeeInput } from '@rental/contracts';
import {
  createEmployee,
  fetchEmployees,
  resetEmployeePassword,
  setEmployeeStatus,
} from '@/features/employees/api/employee-api';

export const EMPLOYEES_QUERY_KEY = ['employees'];

export function useEmployees() {
  return useQuery({ queryFn: fetchEmployees, queryKey: EMPLOYEES_QUERY_KEY });
}

function useInvalidateEmployees() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
}

export function useCreateEmployee() {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: (input: CreateEmployeeInput) => createEmployee(input),
    onSuccess: invalidate,
  });
}

export function useEmployeeStatus() {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: (input: { active: boolean; id: string }) =>
      setEmployeeStatus(input.id, input.active),
    onSuccess: invalidate,
  });
}

export function useResetEmployeePassword() {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: (input: { id: string; password: string }) =>
      resetEmployeePassword(input.id, input.password),
    onSuccess: invalidate,
  });
}
