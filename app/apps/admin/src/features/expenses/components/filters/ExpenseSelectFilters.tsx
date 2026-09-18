import { EXPENSE_CATEGORIES, type Vehicle } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import {
  expenseCategoryKey,
  vehicleOptions,
  type ExpenseFilters,
} from '@/features/expenses/lib/expense-presentation';
import { SelectField } from '@/shared/ui/SelectField';

interface ExpenseSelectFiltersProps {
  filters: ExpenseFilters;
  update: (key: keyof ExpenseFilters, value: string) => void;
  vehicles: Vehicle[];
}

export function ExpenseSelectFilters({ filters, update, vehicles }: ExpenseSelectFiltersProps) {
  const { t } = useTranslation();
  const categories = [
    { label: t('expenseAllCategories'), value: '' },
    ...EXPENSE_CATEGORIES.map((category) => ({
      label: t(expenseCategoryKey(category)),
      value: category,
    })),
  ];
  return (
    <>
      <SelectField
        id="expense-filter-category"
        label={t('expenseFilterCategory')}
        onChange={(value) => update('category', value)}
        options={categories}
        value={filters.category}
      />
      <SelectField
        id="expense-filter-vehicle"
        label={t('expenseFilterVehicle')}
        onChange={(value) => update('vehicleId', value)}
        options={vehicleOptions(vehicles, t('expenseAllVehicles'))}
        value={filters.vehicleId}
      />
    </>
  );
}
