import {
  expenseListSchema,
  expenseSchema,
  type Expense,
  type ExpenseInput,
  type ExpenseList,
  type ExpenseListQuery,
  type ExpenseReversalInput,
} from '@rental/contracts';
import { apiRequest } from '@/shared/api/http';

function listQuery(query: ExpenseListQuery): string {
  const params = new URLSearchParams();
  if (query.category) params.set('category', query.category);
  if (query.from) params.set('from', query.from);
  if (query.to) params.set('to', query.to);
  if (query.vehicleId) params.set('vehicleId', query.vehicleId);
  params.set('limit', String(query.limit));
  return params.toString();
}

export async function fetchExpenses(query: ExpenseListQuery): Promise<ExpenseList> {
  return expenseListSchema.parse(await apiRequest(`/api/expenses?${listQuery(query)}`));
}

export async function recordExpense(input: ExpenseInput): Promise<Expense> {
  return expenseSchema.parse(
    await apiRequest('/api/expenses', { body: JSON.stringify(input), method: 'POST' }),
  );
}

/** Owner only at the API (BR-09); the UI hides the trigger for Staff. */
export async function reverseExpense(id: string, input: ExpenseReversalInput): Promise<Expense> {
  return expenseSchema.parse(
    await apiRequest(`/api/expenses/${id}/reversal`, {
      body: JSON.stringify(input),
      method: 'POST',
    }),
  );
}
