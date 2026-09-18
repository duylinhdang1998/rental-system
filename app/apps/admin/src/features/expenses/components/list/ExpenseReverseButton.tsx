import type { Expense } from '@rental/contracts';
import { Undo2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useSession } from '@/features/auth/hooks/use-session';
import { expenseReversible } from '@/features/expenses/lib/expense-presentation';

interface ExpenseReverseButtonProps {
  expense: Expense;
  onReverse: () => void;
}

/** Owner-only trigger; the API enforces the same rule (BR-09). */
export function ExpenseReverseButton({ expense, onReverse }: ExpenseReverseButtonProps) {
  const { t } = useTranslation();
  const { user } = useSession();
  if (!expenseReversible(expense, user?.role)) return null;
  return (
    <Button onClick={onReverse} size="sm" type="button" variant="outline">
      <Undo2 aria-hidden data-icon="inline-start" />
      {t('expenseReverse')}
    </Button>
  );
}
