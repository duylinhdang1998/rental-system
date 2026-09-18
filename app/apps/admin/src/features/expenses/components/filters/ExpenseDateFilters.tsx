import { useTranslation } from 'react-i18next';
import type { ExpenseFilters } from '@/features/expenses/lib/expense-presentation';
import { TextField } from '@/shared/ui/TextField';

interface ExpenseDateFiltersProps {
  filters: ExpenseFilters;
  update: (key: keyof ExpenseFilters, value: string) => void;
}

export function ExpenseDateFilters({ filters, update }: ExpenseDateFiltersProps) {
  const { t } = useTranslation();
  return (
    <>
      <TextField
        id="expense-from"
        label={t('expenseFrom')}
        onChange={(event) => update('from', event.target.value)}
        type="date"
        value={filters.from}
      />
      <TextField
        id="expense-to"
        label={t('expenseTo')}
        onChange={(event) => update('to', event.target.value)}
        type="date"
        value={filters.to}
      />
    </>
  );
}
