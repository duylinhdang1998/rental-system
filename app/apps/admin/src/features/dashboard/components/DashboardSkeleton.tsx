import { ResultsSkeleton } from '@/shared/ui/ResultsSkeleton';

const CARDS = ['available', 'rented', 'due', 'overdue'];

export function DashboardSkeleton() {
  return (
    <div className="grid gap-5 lg:gap-6">
      <div aria-hidden className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
        {CARDS.map((card) => (
          <div className="surface-card grid gap-4 p-5" key={card}>
            <span className="h-4 w-24 rounded bg-muted" />
            <span className="h-8 w-16 rounded bg-muted" />
            <span className="h-4 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <ResultsSkeleton />
        <div aria-hidden className="surface-card min-h-56 bg-panel-subtle" />
      </div>
    </div>
  );
}
