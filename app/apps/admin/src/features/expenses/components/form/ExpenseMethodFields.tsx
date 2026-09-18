import { EXPENSE_CATEGORIES, type ExpenseCategory, type PaymentMethod } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { PAYMENT_METHODS } from '@/features/contracts/lib/payment-presentation';
import {
  expenseCategoryKey,
  type ExpenseFieldChange,
  type ExpenseFormValues,
} from '@/features/expenses/lib/expense-presentation';
import { SelectField } from '@/shared/ui/SelectField';

interface ExpenseMethodFieldsProps {
  onChange: ExpenseFieldChange;
  values: ExpenseFormValues;
}

export function ExpenseMethodFields({ onChange, values }: ExpenseMethodFieldsProps) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <SelectField
        id="expense-category"
        label={t('expenseFilterCategory')}
        onChange={(value) => onChange('category', value as ExpenseCategory)}
        options={EXPENSE_CATEGORIES.map((category) => ({
          label: t(expenseCategoryKey(category)),
          value: category,
        }))}
        value={values.category}
      />
      <SelectField
        id="expense-method"
        label={t('expenseMethod')}
        onChange={(value) => onChange('method', value as PaymentMethod)}
        options={PAYMENT_METHODS.map((method) => ({
          label: t(`paymentMethodOption.${method}`),
          value: method,
        }))}
        value={values.method}
      />
    </div>
  );
}
