import type { ReactNode } from 'react';

export interface RecordDetail {
  label: string;
  value: ReactNode;
}

export function RecordDetailsList({ details }: { details: RecordDetail[] }) {
  return (
    <dl className="grid gap-4">
      {details.map(({ label, value }) => (
        <div className="grid gap-1 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-4" key={label}>
          <dt className="text-sm text-ink-muted">{label}</dt>
          <dd className="min-w-0 break-words font-medium text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
