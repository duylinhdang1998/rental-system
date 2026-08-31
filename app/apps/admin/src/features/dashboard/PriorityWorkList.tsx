import { AlertCircle, CalendarClock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PriorityItem } from './PriorityItem';

const PRIORITIES = [
  {
    detail: 'HD-0268 · 43A1-123.45',
    labelKey: 'priorityOverdue',
    tone: 'bg-negative-soft text-negative',
  },
  {
    detail: 'HD-0271 · 43A1-909.12 · 10:30',
    labelKey: 'priorityDueSoon',
    tone: 'bg-caution-soft text-caution',
  },
  { detail: 'HD-0275 · 13:00', labelKey: 'priorityBooked', tone: 'bg-brand-soft text-brand' },
];

export function PriorityWorkList() {
  const { t } = useTranslation();
  return (
    <section className="surface-card p-5 lg:p-6">
      <div className="mb-4 flex items-center gap-2">
        <AlertCircle aria-hidden className="size-5 text-negative" />
        <h2 className="text-lg font-extrabold text-ink">{t('priorityTitle')}</h2>
      </div>
      <div className="grid gap-3">
        {PRIORITIES.map((item) => (
          <PriorityItem key={item.detail} {...item} />
        ))}
      </div>
      <button
        className="mt-4 flex min-h-touch items-center gap-2 font-bold text-brand"
        type="button"
      >
        <CalendarClock aria-hidden className="size-5" />
        {t('priorityAll')}
      </button>
    </section>
  );
}
