import type { ContractEvent } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { TimelineEvent } from '@/features/contracts/components/detail/TimelineEvent';

interface ContractTimelineProps {
  events: ContractEvent[];
}

export function ContractTimeline({ events }: ContractTimelineProps) {
  const { t } = useTranslation();
  const ordered = [...events].sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
  return (
    <section className="surface-card p-5" data-mobile-card>
      <h2 className="text-lg font-extrabold text-ink">{t('contractTimeline')}</h2>
      <ol className="mt-4 grid gap-3" data-timeline>
        {ordered.map((event) => (
          <TimelineEvent event={event} key={event.id} />
        ))}
      </ol>
    </section>
  );
}
