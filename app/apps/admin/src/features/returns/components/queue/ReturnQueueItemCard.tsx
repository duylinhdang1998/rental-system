import type { ReturnQueueItem } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { ReturnQueueItemHeading } from '@/features/returns/components/queue/ReturnQueueItemHeading';
import { ReturnQueueLineRow } from '@/features/returns/components/queue/ReturnQueueLineRow';
import type { QueueSelection } from '@/features/returns/hooks/use-return-queue-page';
import { queueReturnTarget } from '@/features/returns/lib/queue-presentation';
import { formatCurrency, resolveInitialLocale } from '@/shared/i18n/locale';

interface ReturnQueueItemCardProps {
  item: ReturnQueueItem;
  onReturn: (selection: QueueSelection) => void;
}

export function ReturnQueueItemCard({ item, onReturn }: ReturnQueueItemCardProps) {
  const { i18n, t } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  return (
    <li className="surface-card grid gap-3 p-4" data-mobile-card data-queue-item={item.code}>
      <ReturnQueueItemHeading item={item} />
      <p className="text-sm text-ink-muted">
        {t('returnQueueVehicles', { returned: item.returnedCount, total: item.vehicleCount })} ·{' '}
        {t('returnQueueDeposit', { amount: formatCurrency(item.depositVnd, locale) })}
      </p>
      <ul className="grid gap-2">
        {item.lines.map((line) => (
          <ReturnQueueLineRow
            key={line.lineId}
            line={line}
            onReturn={() =>
              onReturn({ contractId: item.contractId, target: queueReturnTarget(line) })
            }
          />
        ))}
      </ul>
    </li>
  );
}
