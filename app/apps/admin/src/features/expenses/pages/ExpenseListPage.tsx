import { ExpenseFilterBar } from '@/features/expenses/components/filters/ExpenseFilterBar';
import { ExpenseCreateDialog } from '@/features/expenses/components/form/ExpenseCreateDialog';
import { ExpenseReverseDialog } from '@/features/expenses/components/form/ExpenseReverseDialog';
import { ExpenseHeader } from '@/features/expenses/components/list/ExpenseHeader';
import { ExpenseList } from '@/features/expenses/components/list/ExpenseList';
import { ExpenseSummary } from '@/features/expenses/components/list/ExpenseSummary';
import { useExpensePage } from '@/features/expenses/hooks/use-expense-page';
import { ViewState } from '@/shared/ui/ViewState';

const EMPTY_COPY = { description: 'expenseEmptyBody', title: 'expenseEmptyTitle' };

export function ExpenseListPage() {
  const page = useExpensePage();
  if (page.expenses.isPending) return <ViewState state="loading" />;
  if (page.expenses.isError)
    return <ViewState onRetry={() => void page.expenses.refetch()} state="error" />;
  const list = page.expenses.data;
  return (
    <section className="grid gap-5">
      <ExpenseHeader count={list.count} onRecord={() => page.setFormOpen(true)} />
      <ExpenseSummary list={list} />
      <ExpenseFilterBar
        filters={page.filters}
        onReset={page.reset}
        update={page.update}
        vehicles={page.vehicles}
      />
      {list.items.length ? (
        <ExpenseList items={list.items} onReverse={page.setReversal} />
      ) : (
        <ViewState copy={EMPTY_COPY} heading="section" state="empty" />
      )}
      {page.formOpen ? (
        <ExpenseCreateDialog onClose={() => page.setFormOpen(false)} vehicles={page.vehicles} />
      ) : null}
      {page.reversal ? (
        <ExpenseReverseDialog expense={page.reversal} onClose={page.clearReversal} />
      ) : null}
    </section>
  );
}
