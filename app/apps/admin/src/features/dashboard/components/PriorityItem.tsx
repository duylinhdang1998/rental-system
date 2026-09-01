import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PriorityItemProps {
  detail: string;
  labelKey: string;
  tone: string;
}

export function PriorityItem({ detail, labelKey, tone }: PriorityItemProps) {
  const { t } = useTranslation();
  return (
    <article
      className="flex items-center justify-between rounded-card border border-line p-4"
      data-priority-item
    >
      <div>
        <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${tone}`}>
          {t(labelKey)}
        </span>
        <p className="mt-2 font-bold text-ink">{detail}</p>
      </div>
      <ChevronRight aria-hidden className="size-5 text-ink-muted" />
    </article>
  );
}
