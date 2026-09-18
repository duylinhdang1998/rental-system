import type { Expense } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { ExpenseReverseButton } from '@/features/expenses/components/list/ExpenseReverseButton';
import { ExpenseStatusBadge } from '@/features/expenses/components/list/ExpenseStatusBadge';
import {
  expenseCategoryKey,
  formatPaidOn,
  signedExpenseAmount,
} from '@/features/expenses/lib/expense-presentation';
import { resolveInitialLocale } from '@/shared/i18n/locale';

interface ExpenseCardProps {
  expense: Expense;
  onReverse: () => void;
}

export function ExpenseCard({ expense, onReverse }: ExpenseCardProps) {
  const { i18n, t } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  return (
    <li className="surface-card grid gap-3 p-4" data-expense={expense.id} data-mobile-card>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-ink-muted">
            {formatPaidOn(expense.paidOn, locale)} · {t(expenseCategoryKey(expense.category))}
          </p>
          <h2 className="text-lg font-extrabold text-ink">{expense.description}</h2>
        </div>
        <ExpenseStatusBadge expense={expense} />
      </div>
      <p className="text-sm text-ink-muted">
        {expense.vehicleCode ?? t('expenseNoVehicle')} ·{' '}
        {t(`paymentMethodOption.${expense.method}`)} · {expense.recordedByName}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xl font-black text-ink">{signedExpenseAmount(expense, locale)}</p>
        <ExpenseReverseButton expense={expense} onReverse={onReverse} />
      </div>
    </li>
  );
}
