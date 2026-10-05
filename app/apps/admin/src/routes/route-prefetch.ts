import type { QueryClient } from '@tanstack/react-query';
import { fetchOperationsBoard } from '@/features/dashboard/api/operations-board-api';
import { fetchVehicles } from '@/features/fleet/api/fleet-api';
import { fetchCustomers } from '@/features/customers/api/customers-api';
import { fetchContracts } from '@/features/contracts/api/contracts-api';
import { fetchReturnQueue } from '@/features/returns/api/returns-api';
import { fetchReceivables } from '@/features/finance/api/finance-api';
import { fetchExpenses } from '@/features/expenses/api/expense-api';
import { fetchEmployees } from '@/features/employees/api/employee-api';
import {
  expenseQueryFrom,
  EMPTY_EXPENSE_FILTERS,
} from '@/features/expenses/lib/expense-presentation';

type Prefetch = (client: QueryClient) => Promise<void>;

const PREFETCH: Record<string, Prefetch> = {
  dashboard: async (client) => {
    await client.prefetchQuery({ queryKey: ['operations-board'], queryFn: fetchOperationsBoard });
  },
  vehicles: async (client) => {
    await client.prefetchQuery({ queryKey: ['fleet', {}], queryFn: () => fetchVehicles({}) });
  },
  customers: async (client) => {
    await client.prefetchQuery({
      queryKey: ['customers', undefined],
      queryFn: () => fetchCustomers(),
    });
  },
  contracts: async (client) => {
    await client.prefetchQuery({ queryKey: ['contracts', {}], queryFn: () => fetchContracts({}) });
  },
  returns: async (client) => {
    await client.prefetchQuery({ queryKey: ['return-queue'], queryFn: fetchReturnQueue });
  },
  receivables: async (client) => {
    await client.prefetchQuery({ queryKey: ['receivables'], queryFn: fetchReceivables });
  },
  expenses: async (client) => {
    const query = expenseQueryFrom(EMPTY_EXPENSE_FILTERS);
    await client.prefetchQuery({
      queryKey: ['expenses', query],
      queryFn: () => fetchExpenses(query),
    });
  },
  employees: async (client) => {
    await client.prefetchQuery({ queryKey: ['employees'], queryFn: fetchEmployees });
  },
};

export async function prefetchRoute(client: QueryClient, path: string) {
  await PREFETCH[path === '/' ? 'dashboard' : path.slice(1)]?.(client);
}
