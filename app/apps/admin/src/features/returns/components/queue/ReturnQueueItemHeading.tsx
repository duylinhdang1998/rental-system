import type { ReturnQueueItem } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { KIND_LABEL_KEYS, KIND_TONES } from '@/features/returns/lib/queue-presentation';
import { StatusBadge } from '@/shared/ui/StatusBadge';

interface ReturnQueueItemHeadingProps {
  item: ReturnQueueItem;
}

export function ReturnQueueItemHeading({ item }: ReturnQueueItemHeadingProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div>
        <Link
          className="text-lg font-extrabold text-brand-ink hover:underline"
          to={`/contracts/${item.contractId}`}
        >
          {item.code}
        </Link>
        <p className="text-ink-muted">{item.customerName}</p>
      </div>
      <StatusBadge
        label={t(KIND_LABEL_KEYS[item.kind], { hours: item.hoursLate })}
        tone={KIND_TONES[item.kind]}
      />
    </div>
  );
}
