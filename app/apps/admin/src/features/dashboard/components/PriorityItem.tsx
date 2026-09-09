import type { BoardItem } from '@rental/contracts';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  KIND_LABEL_KEYS,
  KIND_TONES,
  priorityDetail,
} from '@/features/dashboard/lib/board-presentation';
import { formatTime, resolveInitialLocale } from '@/shared/i18n/locale';

interface PriorityItemProps {
  item: BoardItem;
}

export function PriorityItem({ item }: PriorityItemProps) {
  const { i18n, t } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  return (
    <Link
      className="flex items-center justify-between rounded-card border border-line p-4 hover:bg-panel-subtle"
      data-priority-item
      to={`/contracts/${item.contractId}`}
    >
      <div>
        <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${KIND_TONES[item.kind]}`}>
          {t(KIND_LABEL_KEYS[item.kind], { hours: item.hoursLate })}
        </span>
        <p className="mt-2 font-bold text-ink">{priorityDetail(item)}</p>
        <p className="text-sm text-ink-muted">{formatTime(item.dueAt, locale)}</p>
      </div>
      <ChevronRight aria-hidden className="size-5 text-ink-muted" />
    </Link>
  );
}
