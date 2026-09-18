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
      className="surface-card min-w-0 p-4 sm:p-5"
      data-mobile-card
      data-priority-item={label === 'Quá hạn' ? true : undefined}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-ink-muted">{label}</p>
        <span className={`shrink-0 rounded-control p-2 ${tone}`}>
          <Icon aria-hidden className="size-5" />
        </span>
      </div>
      {/* Eight-digit amounts share a 360 px row with a sibling card, so the value may shrink and break. */}
      <p className="break-words text-2xl font-extrabold tabular-nums text-ink sm:text-3xl">
        {value}
      </p>
      <p className="mt-2 text-sm font-semibold text-ink-muted">{context}</p>
    </article>
  );
}
