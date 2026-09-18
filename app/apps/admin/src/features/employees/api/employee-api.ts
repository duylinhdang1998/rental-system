import {
  employeeListSchema,
  employeeSchema,
  type CreateEmployeeInput,
  type Employee,
  type EmployeeList,
} from '@rental/contracts';
import { apiRequest } from '@/shared/api/http';

export async function fetchEmployees(): Promise<EmployeeList> {
  return employeeListSchema.parse(await apiRequest('/api/employees'));
}

export async function createEmployee(input: CreateEmployeeInput): Promise<Employee> {
  return employeeSchema.parse(
    await apiRequest('/api/employees', { body: JSON.stringify(input), method: 'POST' }),
  );
}

export async function setEmployeeStatus(id: string, active: boolean): Promise<Employee> {
  return employeeSchema.parse(
    await apiRequest(`/api/employees/${id}/status`, {
      body: JSON.stringify({ active }),
      method: 'PATCH',
    }),
  );
}

export async function resetEmployeePassword(id: string, password: string): Promise<Employee> {
  return employeeSchema.parse(
    await apiRequest(`/api/employees/${id}/password`, {
      body: JSON.stringify({ password }),
      method: 'POST',
    }),
  );
}
