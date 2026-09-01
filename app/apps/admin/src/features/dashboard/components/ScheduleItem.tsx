import { Clock3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ScheduleItemProps {
  contract: string;
  customer: string;
  statusKey: string;
  time: string;
  vehicle: string;
}

export function ScheduleItem(props: ScheduleItemProps) {
  const { t } = useTranslation();
  return (
    <article
      className="grid gap-3 rounded-card border border-line p-4 sm:grid-cols-5 sm:items-center"
      data-mobile-card
    >
      <p className="flex items-center gap-2 font-extrabold text-brand">
        <Clock3 aria-hidden className="size-4" />
        {props.time}
      </p>
      <p className="font-bold text-ink">{props.contract}</p>
      <p className="text-ink-muted">{props.customer}</p>
      <p className="text-ink-muted">{props.vehicle}</p>
      <span className="w-fit rounded-full bg-caution-soft px-3 py-1 text-xs font-extrabold text-caution">
        {t(props.statusKey)}
      </span>
    </article>
  );
}
