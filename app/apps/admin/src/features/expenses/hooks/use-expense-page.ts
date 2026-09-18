import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Expense } from '@rental/contracts';
import { useExpenses } from '@/features/expenses/hooks/use-expenses';
import {
  expenseQueryFrom,
  type ExpenseFilters,
} from '@/features/expenses/lib/expense-presentation';
import { useFleet } from '@/features/fleet/hooks/use-fleet';

function filtersFrom(params: URLSearchParams): ExpenseFilters {
  return {
    category: params.get('category') ?? '',
    from: params.get('from') ?? '',
    to: params.get('to') ?? '',
    vehicleId: params.get('vehicleId') ?? '',
  };
}

/** Filters live in the URL so a reload or a shared link keeps the same ledger view. */
export function useExpensePage() {
  const [params, setParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);
  const [reversal, setReversal] = useState<Expense | null>(null);
  const filters = filtersFrom(params);
  const expenses = useExpenses(expenseQueryFrom(filters));
  const fleet = useFleet({});
  const update = (key: keyof ExpenseFilters, value: string) =>
    setParams((current) => {
      if (value) current.set(key, value);
      else current.delete(key);
      return current;
    });
  return {
    clearReversal: () => setReversal(null),
    expenses,
    filters,
    formOpen,
    reset: () => setParams({}),
    reversal,
    setFormOpen,
    setReversal,
    update,
    vehicles: fleet.data?.items ?? [],
  };
}
