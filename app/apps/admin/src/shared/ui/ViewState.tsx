import { AlertTriangle, CheckCircle2, LoaderCircle, RotateCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface ViewStateProps {
  onRetry?: () => void;
  state: 'loading' | 'empty' | 'error';
}

const COPY_KEYS = {
  empty: { description: 'emptyBody', title: 'emptyTitle' },
  error: { description: 'errorBody', title: 'errorTitle' },
  loading: { description: 'loadingBody', title: 'loadingTitle' },
};

export function ViewState({ onRetry, state }: ViewStateProps) {
  const { t } = useTranslation();
  const Icon =
    state === 'loading' ? LoaderCircle : state === 'error' ? AlertTriangle : CheckCircle2;
  return (
    <section
      className="surface-card flex min-h-64 flex-col items-center justify-center p-8 text-center"
      data-mobile-card
    >
      <Icon
        aria-hidden
        className={`mb-4 size-10 ${state === 'loading' ? 'animate-spin text-brand' : state === 'error' ? 'text-negative' : 'text-positive'}`}
      />
      <h1 className="text-2xl font-extrabold text-ink">{t(COPY_KEYS[state].title)}</h1>
      <p className="mt-2 max-w-lg text-ink-muted">{t(COPY_KEYS[state].description)}</p>
      {state === 'error' ? (
        <Button className="mt-5" onClick={onRetry} type="button">
          <RotateCw aria-hidden data-icon="inline-start" />
          {t('retry')}
        </Button>
      ) : null}
      {state === 'empty' ? (
        <Button asChild className="mt-5" variant="outline">
          <Link to="/vehicles">{t('emptyAction')}</Link>
        </Button>
      ) : null}
    </section>
  );
}
