import type { ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ResultsSkeleton } from '@/shared/ui/ResultsSkeleton';
import { ViewState } from '@/shared/ui/ViewState';

interface QueryRegionProps<T> {
  query: UseQueryResult<T, Error>;
  children: (data: T) => ReactNode;
  skeleton?: ReactNode;
}

export function QueryRegion<T>({ query, children, skeleton }: QueryRegionProps<T>) {
  const { t } = useTranslation();
  if (query.data === undefined)
    return query.isError ? (
      <ViewState heading="section" onRetry={() => void query.refetch()} state="error" />
    ) : (
      (skeleton ?? <ResultsSkeleton />)
    );
  return (
    <section aria-busy={query.isFetching} className="grid gap-3" data-testid="query-region">
      <p className="min-h-5 text-sm text-ink-muted" role="status">
        {query.isFetching ? t('dataLoadingTitle') : null}
      </p>
      {query.isError ? (
        <ViewState heading="section" onRetry={() => void query.refetch()} state="error" />
      ) : null}
      <div className="query-content" inert={query.isPlaceholderData || undefined}>
        {children(query.data)}
      </div>
    </section>
  );
}
