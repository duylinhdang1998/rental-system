import type { ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ResultsSkeleton } from '@/shared/ui/ResultsSkeleton';
import { ViewState, type ViewStateCopy } from '@/shared/ui/ViewState';

interface QueryRegionProps<T> {
  query: UseQueryResult<T, Error>;
  children: (data: T) => ReactNode;
  skeleton?: ReactNode;
  errorCopy?: ViewStateCopy;
}

export function QueryRegion<T>({ query, children, skeleton, errorCopy }: QueryRegionProps<T>) {
  const { t } = useTranslation();
  const error = query.isError ? (
    <ViewState
      copy={errorCopy}
      heading="section"
      onRetry={() => void query.refetch()}
      state="error"
    />
  ) : null;
  if (query.data === undefined) return error ?? skeleton ?? <ResultsSkeleton />;
  return (
    <section aria-busy={query.isFetching} className="grid gap-3" data-testid="query-region">
      <p className="min-h-5 text-sm text-ink-muted" role="status">
        {query.isFetching ? t('dataLoadingTitle') : null}
      </p>
      {error}
      <div className="query-content" inert={query.isPlaceholderData || undefined}>
        {children(query.data)}
      </div>
    </section>
  );
}
