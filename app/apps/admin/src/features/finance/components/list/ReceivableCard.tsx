import type { ReceivableItem } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ReceivableAgeBadge } from '@/features/finance/components/list/ReceivableAgeBadge';
import { ReceivableCollectButton } from '@/features/finance/components/list/ReceivableCollectButton';
import { formatCurrency, formatDateTime, resolveInitialLocale } from '@/shared/i18n/locale';

interface ReceivableCardProps {
  item: ReceivableItem;
  onCollect: () => void;
}

export function ReceivableCard({ item, onCollect }: ReceivableCardProps) {
  const { i18n, t } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  return (
    <li className="surface-card grid gap-3 p-4" data-mobile-card data-receivable={item.code}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Link
            className="text-lg font-extrabold text-brand hover:underline"
            to={`/contracts/${item.contractId}`}
          >
            {item.code}
          </Link>
          <p className="text-ink-muted">{item.customerName}</p>
        </div>
        <ReceivableAgeBadge days={item.daysOutstanding} />
      </div>
      <p className="text-sm text-ink-muted">
        {t('receivableDue', { time: formatDateTime(item.dueAt, locale) })} · {t('receivablePaid')}{' '}
        {formatCurrency(item.paidVnd, locale)}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xl font-black text-negative">
          {formatCurrency(item.remainingVnd, locale)}
        </p>
        <ReceivableCollectButton onCollect={onCollect} />
      </div>
    </li>
  );
}
