import type { Expense } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { expenseStatus } from '@/features/expenses/lib/expense-presentation';
import { StatusBadge } from '@/shared/ui/StatusBadge';

interface ExpenseStatusBadgeProps {
  expense: Expense;
}

/** Originals carry no badge; only the two reversal states need a marker. */
export function ExpenseStatusBadge({ expense }: ExpenseStatusBadgeProps) {
  const { t } = useTranslation();
  const status = expenseStatus(expense);
  if (status === 'ORIGINAL') return null;
  return (
    <span className="mt-1 inline-block">
      <StatusBadge
        label={t(`expenseStatus.${status}`)}
        tone={status === 'REVERSED' ? 'neutral' : 'warning'}
      />
    </span>
  );
}
