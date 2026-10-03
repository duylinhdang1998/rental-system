import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <section className="mx-auto flex min-h-80 max-w-lg flex-col items-center justify-center gap-3 text-center">
      <p className="text-sm text-ink-muted">404</p>
      <h1 className="type-h1 text-ink">{t('notFoundTitle')}</h1>
      <p className="text-pretty text-ink-muted">{t('notFoundBody')}</p>
      <Button asChild className="mt-3" variant="outline">
        <Link to="/">{t('backToOverview')}</Link>
      </Button>
    </section>
  );
}
