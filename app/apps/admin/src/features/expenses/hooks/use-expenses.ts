import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import type {
  Expense,
  ExpenseInput,
  ExpenseList,
  ExpenseListQuery,
  ExpenseReversalInput,
} from '@rental/contracts';
import { fetchExpenses, recordExpense, reverseExpense } from '@/features/expenses/api/expense-api';

const INVALIDATED_KEYS = [['expenses'], ['fleet-economics']];

export function useExpenses(query: ExpenseListQuery): UseQueryResult<ExpenseList, Error> {
  return useQuery({ queryFn: () => fetchExpenses(query), queryKey: ['expenses', query] });
}

function useExpenseInvalidation() {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all(
      INVALIDATED_KEYS.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
    );
  };
}

export function useRecordExpense() {
  const invalidate = useExpenseInvalidation();
  return useMutation<Expense, Error, ExpenseInput>({
    mutationFn: recordExpense,
    onSuccess: invalidate,
  });
}

export function useReverseExpense(id: string) {
  const invalidate = useExpenseInvalidation();
  return useMutation<Expense, Error, ExpenseReversalInput>({
    mutationFn: (input) => reverseExpense(id, input),
    onSuccess: invalidate,
  });
}
