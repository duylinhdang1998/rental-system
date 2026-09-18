import type { Expense } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { TableBody } from '@/components/ui/table-body';
import { TableHead } from '@/components/ui/table-head';
import { TableHeader } from '@/components/ui/table-header';
import { Table } from '@/components/ui/table-root';
import { TableRow } from '@/components/ui/table-row';
import { ExpenseTableRow } from '@/features/expenses/components/list/ExpenseTableRow';

interface ExpenseTableProps {
  items: Expense[];
  onReverse: (expense: Expense) => void;
}

const COLUMN_KEYS = ['paidOn', 'category', 'description', 'vehicle', 'method', 'amount'];

export function ExpenseTable({ items, onReverse }: ExpenseTableProps) {
  const { t } = useTranslation();
  return (
    <div className="surface-card hidden overflow-x-auto sm:block">
      <Table>
        <TableHeader className="bg-panel-subtle text-sm text-ink-muted">
          <TableRow>
            {COLUMN_KEYS.map((key) => (
              <TableHead key={key}>{t(`expenseColumns.${key}`)}</TableHead>
            ))}
            <TableHead>
              <span className="sr-only">{t('expenseColumns.actions')}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <ExpenseTableRow expense={item} key={item.id} onReverse={() => onReverse(item)} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
