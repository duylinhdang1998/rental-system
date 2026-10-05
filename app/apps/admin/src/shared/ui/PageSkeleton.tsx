import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { navigationForRole } from '@/shared/navigation/routes';
import { ResultsSkeleton } from '@/shared/ui/ResultsSkeleton';

export function PageSkeleton() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const item = navigationForRole('OWNER').find(
    ({ path }) => path === pathname || (path !== '/' && pathname.startsWith(`${path}/`)),
  );
  return (
    <section className="grid gap-5" data-testid="page-skeleton">
      <header className="grid gap-2">
        <div aria-hidden className="h-4 w-32 rounded bg-muted" />
        <h1 className="type-h1">{t(item?.key ?? 'dataLoadingTitle')}</h1>
        <div aria-hidden className="h-5 w-64 max-w-full rounded bg-muted" />
      </header>
      <ResultsSkeleton />
    </section>
  );
}
