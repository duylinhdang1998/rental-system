import type { Expense } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { LifecycleDialogShell } from '@/features/contracts/components/lifecycle/LifecycleDialogShell';
import { ExpenseReverseForm } from '@/features/expenses/components/form/ExpenseReverseForm';
import { formatCurrency, resolveInitialLocale } from '@/shared/i18n/locale';

interface ExpenseReverseDialogProps {
  expense: Expense;
  onClose: () => void;
}

export function ExpenseReverseDialog({ expense, onClose }: ExpenseReverseDialogProps) {
  const { i18n, t } = useTranslation();
  const amount = formatCurrency(expense.amountVnd, resolveInitialLocale(i18n.language));
  return (
    <LifecycleDialogShell
      description={t('expenseReverseBody', { amount })}
      onClose={onClose}
      title={t('expenseReverseTitle')}
    >
      <ExpenseReverseForm expenseId={expense.id} onClose={onClose} />
    </LifecycleDialogShell>
  );
}
