import { AlertTriangle, Inbox, LoaderCircle, RotateCw } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface ViewStateCopy {
  description: string;
  title: string;
}

interface ViewStateProps {
  action?: ReactNode;
  copy?: ViewStateCopy;
  heading?: 'page' | 'section';
  onRetry?: () => void;
  state: 'loading' | 'empty' | 'error';
}

const COPY_KEYS: Record<ViewStateProps['state'], ViewStateCopy> = {
  empty: { description: 'emptyBody', title: 'emptyTitle' },
  error: { description: 'dataErrorBody', title: 'dataErrorTitle' },
  loading: { description: 'dataLoadingBody', title: 'dataLoadingTitle' },
};
const STATE_ICONS = { empty: Inbox, error: AlertTriangle, loading: LoaderCircle };
const ICON_CLASSES = {
  empty: 'text-ink-muted',
  error: 'text-negative',
  loading: 'animate-spin text-brand-ink',
};
const VIEW_STATE_CLASS =
  'surface-card flex min-h-56 flex-col items-center justify-center p-4 sm:p-5 text-center';

export function ViewState(props: ViewStateProps) {
  const { t } = useTranslation();
  const { state } = props;
  const copy = props.copy ?? COPY_KEYS[state];
  const Heading = props.heading === 'section' ? 'h3' : 'h1';
  const Icon = STATE_ICONS[state];
  return (
    <section aria-busy={state === 'loading'} className={VIEW_STATE_CLASS} data-mobile-card>
      <Icon aria-hidden className={`mb-4 size-10 ${ICON_CLASSES[state]}`} />
      <Heading className="text-lg font-semibold text-ink">{t(copy.title)}</Heading>
      <p className="mt-2 max-w-lg text-pretty text-ink-muted">{t(copy.description)}</p>
      {state === 'error' ? (
        <Button className="mt-5" onClick={props.onRetry} type="button">
          <RotateCw aria-hidden data-icon="inline-start" />
          {t('retry')}
        </Button>
      ) : null}
      {props.action ? <div className="mt-5">{props.action}</div> : null}
    </section>
  );
}
