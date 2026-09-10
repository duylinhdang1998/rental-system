import type { ReturnQueue } from '@rental/contracts';
import type { TFunction } from 'i18next';
import { AlertCircle, CalendarClock, Route } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { queueHighlights } from '@/features/returns/lib/queue-presentation';
import { formatTime, resolveInitialLocale, type Locale } from '@/shared/i18n/locale';
import { KpiCard } from '@/shared/ui/KpiCard';

interface ReturnQueueSummaryProps {
  queue: ReturnQueue;
}

type SummaryKey = 'dueToday' | 'overdue' | 'renting';

const SUMMARY_CARDS: { icon: typeof Route; key: SummaryKey; labelKey: string; tone: string }[] = [
  {
    icon: AlertCircle,
    key: 'overdue',
    labelKey: 'overdue',
    tone: 'bg-negative-soft text-negative',
  },
  {
    icon: CalendarClock,
    key: 'dueToday',
    labelKey: 'dueToday',
    tone: 'bg-caution-soft text-caution',
  },
  {
    icon: Route,
    key: 'renting',
    labelKey: 'returnQueueRenting',
    tone: 'bg-information-soft text-information',
  },
];

function contexts(queue: ReturnQueue, t: TFunction, locale: Locale): Record<SummaryKey, string> {
  const highlights = queueHighlights(queue);
  const nearest = highlights.nearestDueAt ? formatTime(highlights.nearestDueAt, locale) : null;
  return {
    dueToday: nearest ? t('kpiNearestDue', { time: nearest }) : t('kpiNoDue'),
    overdue: queue.overdue
      ? t('kpiMaxLate', { hours: highlights.maxHoursLate })
      : t('kpiNoOverdue'),
    renting: t('returnQueueVehiclesOut', { count: highlights.vehiclesOut }),
  };
}

export function ReturnQueueSummary({ queue }: ReturnQueueSummaryProps) {
  const { i18n, t } = useTranslation();
  const context = contexts(queue, t, resolveInitialLocale(i18n.language));
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5">
      {SUMMARY_CARDS.map((card) => (
        <KpiCard
          context={context[card.key]}
          icon={card.icon}
          key={card.key}
          label={t(card.labelKey)}
          tone={card.tone}
          value={String(queue[card.key])}
        />
      ))}
    </div>
  );
}
