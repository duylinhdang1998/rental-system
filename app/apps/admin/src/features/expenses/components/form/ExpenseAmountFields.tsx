import { useTranslation } from 'react-i18next';
import type {
  ExpenseFieldChange,
  ExpenseFormValues,
} from '@/features/expenses/lib/expense-presentation';
import { TextField } from '@/shared/ui/TextField';

interface ExpenseAmountFieldsProps {
  onChange: ExpenseFieldChange;
  values: ExpenseFormValues;
}

const MAX_AMOUNT = 1_000_000_000;

export function ExpenseAmountFields({ onChange, values }: ExpenseAmountFieldsProps) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField
        data-dialog-autofocus=""
        id="expense-amount"
        inputMode="numeric"
        label={t('expenseAmount')}
        max={MAX_AMOUNT}
        min={1}
        onChange={(event) => onChange('amount', event.target.value)}
        required
        type="number"
        value={values.amount}
      />
      <TextField
        id="expense-paid-on"
        label={t('expensePaidOn')}
        onChange={(event) => onChange('paidOn', event.target.value)}
        required
        type="date"
        value={values.paidOn}
      />
    </div>
  );
}
