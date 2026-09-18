import type { Vehicle } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ExpenseDateFilters } from '@/features/expenses/components/filters/ExpenseDateFilters';
import { ExpenseSelectFilters } from '@/features/expenses/components/filters/ExpenseSelectFilters';
import type { ExpenseFilters } from '@/features/expenses/lib/expense-presentation';

interface ExpenseFilterBarProps {
  filters: ExpenseFilters;
  onReset: () => void;
  update: (key: keyof ExpenseFilters, value: string) => void;
  vehicles: Vehicle[];
}

export function ExpenseFilterBar({ filters, onReset, update, vehicles }: ExpenseFilterBarProps) {
  const { t } = useTranslation();
  return (
    <form className="surface-card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
      <ExpenseDateFilters filters={filters} update={update} />
      <ExpenseSelectFilters filters={filters} update={update} vehicles={vehicles} />
      <Button onClick={onReset} type="button" variant="outline">
        {t('expenseReset')}
      </Button>
    </form>
  );
}
