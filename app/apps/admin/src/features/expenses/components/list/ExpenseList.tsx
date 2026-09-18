import type { Expense } from '@rental/contracts';
import { ExpenseCard } from '@/features/expenses/components/list/ExpenseCard';
import { ExpenseTable } from '@/features/expenses/components/list/ExpenseTable';

interface ExpenseListProps {
  items: Expense[];
  onReverse: (expense: Expense) => void;
}

/** Table on wide screens, cards on phones — the same ledger rows either way. */
export function ExpenseList({ items, onReverse }: ExpenseListProps) {
  return (
    <>
      <ExpenseTable items={items} onReverse={onReverse} />
      <ul className="grid gap-3 sm:hidden">
        {items.map((item) => (
          <ExpenseCard expense={item} key={item.id} onReverse={() => onReverse(item)} />
        ))}
      </ul>
    </>
  );
}
