import type { ReceivableItem } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { TableBody } from '@/components/ui/table-body';
import { TableHead } from '@/components/ui/table-head';
import { TableHeader } from '@/components/ui/table-header';
import { Table } from '@/components/ui/table-root';
import { TableRow } from '@/components/ui/table-row';
import { ReceivableTableRow } from '@/features/finance/components/list/ReceivableTableRow';

interface ReceivableTableProps {
  items: ReceivableItem[];
  onCollect: (item: ReceivableItem) => void;
}

export function ReceivableTable({ items, onCollect }: ReceivableTableProps) {
  const { t } = useTranslation();
  return (
    <div className="surface-card hidden overflow-hidden sm:block">
      <Table>
        <TableHeader className="bg-panel-subtle text-sm text-ink-muted">
          <TableRow>
            <TableHead>{t('contracts')}</TableHead>
            <TableHead>{t('receivableDue', { time: '' }).trim()}</TableHead>
            <TableHead>{t('receivablePaid')}</TableHead>
            <TableHead>{t('receivableRemaining')}</TableHead>
            <TableHead>
              <span className="sr-only">{t('contractActions')}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <ReceivableTableRow
              item={item}
              key={item.contractId}
              onCollect={() => onCollect(item)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
