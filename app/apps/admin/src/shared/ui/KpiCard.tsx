import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  context: string;
  icon: LucideIcon;
  label: string;
  tone: string;
  value: string;
}

export function KpiCard({ context, icon: Icon, label, tone, value }: KpiCardProps) {
  return (
    <article
      className="surface-card p-4 sm:p-5"
      data-mobile-card
      data-priority-item={label === 'Quá hạn' ? true : undefined}
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-bold text-ink-muted">{label}</p>
        <span className={`rounded-control p-2 ${tone}`}>
          <Icon aria-hidden className="size-5" />
        </span>
      </div>
      <p className="text-3xl font-extrabold tabular-nums text-ink">{value}</p>
      <p className="mt-2 text-sm font-semibold text-ink-muted">{context}</p>
    </article>
  );
}
