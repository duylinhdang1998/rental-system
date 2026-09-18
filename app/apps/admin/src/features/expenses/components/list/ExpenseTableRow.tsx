import type { Expense } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { TableCell } from '@/components/ui/table-cell';
import { TableRow } from '@/components/ui/table-row';
import { ExpenseReverseButton } from '@/features/expenses/components/list/ExpenseReverseButton';
import { ExpenseStatusBadge } from '@/features/expenses/components/list/ExpenseStatusBadge';
import {
  expenseCategoryKey,
  formatPaidOn,
  signedExpenseAmount,
} from '@/features/expenses/lib/expense-presentation';
import { resolveInitialLocale } from '@/shared/i18n/locale';

interface ExpenseTableRowProps {
  expense: Expense;
  onReverse: () => void;
}

export function ExpenseTableRow({ expense, onReverse }: ExpenseTableRowProps) {
  const { i18n, t } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  return (
    <TableRow data-expense={expense.id}>
      <TableCell className="whitespace-nowrap">{formatPaidOn(expense.paidOn, locale)}</TableCell>
      <TableCell>{t(expenseCategoryKey(expense.category))}</TableCell>
      <TableCell className="font-bold text-ink">
        {expense.description}
        <span className="block text-xs font-semibold text-ink-muted">
          {expense.recordedByName}
          {expense.reference ? ` · ${expense.reference}` : ''}
        </span>
        <ExpenseStatusBadge expense={expense} />
      </TableCell>
      <TableCell>{expense.vehicleCode ?? t('expenseNoVehicle')}</TableCell>
      <TableCell>{t(`paymentMethodOption.${expense.method}`)}</TableCell>
      <TableCell className="whitespace-nowrap font-black text-ink">
        {signedExpenseAmount(expense, locale)}
      </TableCell>
      <TableCell>
        <ExpenseReverseButton expense={expense} onReverse={onReverse} />
      </TableCell>
    </TableRow>
  );
}
