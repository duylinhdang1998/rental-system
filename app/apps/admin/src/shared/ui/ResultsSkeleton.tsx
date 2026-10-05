import { LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ROWS = ['first', 'second', 'third', 'fourth', 'fifth'];

export function ResultsSkeleton() {
  const { t } = useTranslation();
  return (
    <section aria-busy="true" className="grid gap-3" data-testid="results-skeleton">
      <h3 className="sr-only">{t('dataLoadingTitle')}</h3>
      <p className="flex items-center gap-2 text-sm text-ink-muted" role="status">
        <LoaderCircle aria-hidden className="size-4 animate-spin" /> {t('dataLoadingBody')}
      </p>
      <div aria-hidden className="surface-card overflow-hidden">
        <div className="h-12 border-b border-line bg-panel-subtle" />
        {ROWS.map((row) => (
          <div
            className="grid h-20 grid-cols-3 items-center gap-6 border-b border-line px-4 last:border-0 sm:h-16 sm:grid-cols-5"
            key={row}
          >
            <span className="h-3 rounded-full bg-muted" />
            <span className="h-3 rounded-full bg-muted" />
            <span className="h-3 rounded-full bg-muted" />
            <span className="hidden h-3 rounded-full bg-muted sm:block" />
            <span className="hidden h-3 rounded-full bg-muted sm:block" />
          </div>
        ))}
      </div>
    </section>
  );
}
