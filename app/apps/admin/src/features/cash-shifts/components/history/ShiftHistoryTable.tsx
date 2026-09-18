import type { CashShift } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { TableBody } from '@/components/ui/table-body';
import { TableHead } from '@/components/ui/table-head';
import { TableHeader } from '@/components/ui/table-header';
import { Table } from '@/components/ui/table-root';
import { TableRow } from '@/components/ui/table-row';
import { ShiftHistoryTableRow } from '@/features/cash-shifts/components/history/ShiftHistoryTableRow';

interface ShiftHistoryTableProps {
  items: CashShift[];
}

const COLUMN_KEYS = [
  'openedAt',
  'openedBy',
  'closedAt',
  'closedBy',
  'expected',
  'counted',
  'variance',
  'note',
];

export function ShiftHistoryTable({ items }: ShiftHistoryTableProps) {
  const { t } = useTranslation();
  return (
    <div className="surface-card hidden overflow-x-auto sm:block">
      <Table>
        <TableHeader className="bg-panel-subtle text-sm text-ink-muted">
          <TableRow>
            {COLUMN_KEYS.map((key) => (
              <TableHead key={key}>{t(`cashShiftColumns.${key}`)}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <ShiftHistoryTableRow key={item.id} shift={item} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
