import { ExpenseFilterBar } from '@/features/expenses/components/filters/ExpenseFilterBar';
import { ExpenseCreateDialog } from '@/features/expenses/components/form/ExpenseCreateDialog';
import { ExpenseReverseDialog } from '@/features/expenses/components/form/ExpenseReverseDialog';
import { ExpenseHeader } from '@/features/expenses/components/list/ExpenseHeader';
import { ExpenseResults } from '@/features/expenses/components/list/ExpenseResults';
import { useExpensePage } from '@/features/expenses/hooks/use-expense-page';
import { QueryRegion } from '@/shared/ui/QueryRegion';

export function ExpenseListPage() {
  const page = useExpensePage();
  const list = page.expenses.data;
  return (
    <section className="grid gap-5">
      <ExpenseHeader count={list?.count ?? 0} onRecord={() => page.setFormOpen(true)} />
      <ExpenseFilterBar
        filters={page.filters}
        onReset={page.reset}
        update={page.update}
        vehicles={page.vehicles}
      />
      <QueryRegion query={page.expenses}>
        {(data) => <ExpenseResults data={data} onReverse={page.setReversal} />}
      </QueryRegion>
      {page.formOpen ? (
        <ExpenseCreateDialog onClose={() => page.setFormOpen(false)} vehicles={page.vehicles} />
      ) : null}
      {page.reversal ? (
        <ExpenseReverseDialog expense={page.reversal} onClose={page.clearReversal} />
      ) : null}
    </section>
  );
}
