import type { Expense, ExpenseList as ExpenseListData } from '@rental/contracts';
import { ExpenseList } from '@/features/expenses/components/list/ExpenseList';
import { ExpenseSummary } from '@/features/expenses/components/list/ExpenseSummary';
import { ViewState } from '@/shared/ui/ViewState';

const EMPTY_COPY = { description: 'expenseEmptyBody', title: 'expenseEmptyTitle' };

export function ExpenseResults({
  data,
  onReverse,
}: {
  data: ExpenseListData;
  onReverse: (expense: Expense) => void;
}) {
  return (
    <div className="grid gap-5">
      <ExpenseSummary list={data} />
      {data.items.length ? (
        <ExpenseList items={data.items} onReverse={onReverse} />
      ) : (
        <ViewState copy={EMPTY_COPY} heading="section" state="empty" />
      )}
    </div>
  );
}
