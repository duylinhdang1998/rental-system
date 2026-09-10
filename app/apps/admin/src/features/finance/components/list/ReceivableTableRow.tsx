import type { ReceivableItem } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { TableCell } from '@/components/ui/table-cell';
import { TableRow } from '@/components/ui/table-row';
import { ReceivableAgeBadge } from '@/features/finance/components/list/ReceivableAgeBadge';
import { ReceivableCollectButton } from '@/features/finance/components/list/ReceivableCollectButton';
import { formatCurrency, formatDateTime, resolveInitialLocale } from '@/shared/i18n/locale';

interface ReceivableTableRowProps {
  item: ReceivableItem;
  onCollect: () => void;
}

export function ReceivableTableRow({ item, onCollect }: ReceivableTableRowProps) {
  const { i18n } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  return (
    <TableRow data-receivable={item.code}>
      <TableCell className="font-extrabold">
        <Link className="text-brand hover:underline" to={`/contracts/${item.contractId}`}>
          {item.code}
        </Link>
        <span className="block text-xs font-semibold text-ink-muted">{item.customerName}</span>
      </TableCell>
      <TableCell>
        {formatDateTime(item.dueAt, locale)}
        <span className="mt-1 block">
          <ReceivableAgeBadge days={item.daysOutstanding} />
        </span>
      </TableCell>
      <TableCell>
        {formatCurrency(item.paidVnd, locale)}
        <span className="text-ink-muted"> / {formatCurrency(item.totalDueVnd, locale)}</span>
      </TableCell>
      <TableCell className="font-black text-negative">
        {formatCurrency(item.remainingVnd, locale)}
      </TableCell>
      <TableCell>
        <ReceivableCollectButton onCollect={onCollect} />
      </TableCell>
    </TableRow>
  );
}
