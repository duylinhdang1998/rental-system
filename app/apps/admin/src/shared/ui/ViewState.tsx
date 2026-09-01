import { AlertTriangle, CheckCircle2, LoaderCircle, RotateCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface ViewStateProps {
  heading?: 'page' | 'section';
  onRetry?: () => void;
  state: 'loading' | 'empty' | 'error';
}

const COPY_KEYS = {
  empty: { description: 'emptyBody', title: 'emptyTitle' },
  error: { description: 'errorBody', title: 'errorTitle' },
  loading: { description: 'loadingBody', title: 'loadingTitle' },
};
const STATE_ICONS = { empty: CheckCircle2, error: AlertTriangle, loading: LoaderCircle };
const VIEW_STATE_CLASS =
  'surface-card flex min-h-64 flex-col items-center justify-center p-8 text-center';

export function ViewState(props: ViewStateProps) {
  const { t } = useTranslation();
  const { state } = props;
  const Heading = props.heading === 'section' ? 'h3' : 'h1';
  const Icon = STATE_ICONS[state];
  return (
    <section className={VIEW_STATE_CLASS} data-mobile-card>
      <Icon
        aria-hidden
        className={`mb-4 size-10 ${state === 'loading' ? 'animate-spin text-brand' : state === 'error' ? 'text-negative' : 'text-positive'}`}
      />
      <Heading className="type-h2 text-ink">{t(COPY_KEYS[state].title)}</Heading>
      <p className="mt-2 max-w-lg text-ink-muted">{t(COPY_KEYS[state].description)}</p>
      {state === 'error' ? (
        <Button className="mt-5" onClick={props.onRetry} type="button">
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
