import type { BoardItem } from '@rental/contracts';
import { Clock3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { KIND_LABEL_KEYS, KIND_TONES } from '@/features/dashboard/lib/board-presentation';
import { formatTime, resolveInitialLocale } from '@/shared/i18n/locale';

interface ScheduleItemProps {
  item: BoardItem;
}

export function ScheduleItem({ item }: ScheduleItemProps) {
  const { i18n, t } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  return (
    <article
      className="grid gap-3 rounded-card border border-line p-4 sm:grid-cols-5 sm:items-center"
      data-mobile-card
    >
      <p className="flex items-center gap-2 font-extrabold text-brand-ink">
        <Clock3 aria-hidden className="size-4" />
        {formatTime(item.dueAt, locale)}
      </p>
      <Link className="font-bold text-ink hover:underline" to={`/contracts/${item.contractId}`}>
        {item.code}
      </Link>
      <p className="text-ink-muted">{item.customerName}</p>
      <p className="text-ink-muted">{item.vehicleCodes.join(', ')}</p>
      <span
        className={`w-fit rounded-full px-3 py-1 text-xs font-extrabold ${KIND_TONES[item.kind]}`}
      >
        {t(KIND_LABEL_KEYS[item.kind], { hours: item.hoursLate })}
      </span>
    </article>
  );
}
