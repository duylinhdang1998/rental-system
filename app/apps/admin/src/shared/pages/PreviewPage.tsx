import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PreviewModule } from '@rental/contracts';
import { ViewState } from '@/shared/ui/ViewState';
import { usePreview } from '@/shared/pages/use-preview';

interface PreviewPageProps {
  routeKey: PreviewModule;
  sprint: number;
}

export function PreviewPage({ routeKey, sprint }: PreviewPageProps) {
  const { t } = useTranslation();
  const preview = usePreview(routeKey);
  if (preview.isPending) return <ViewState state="loading" />;
  if (preview.isError) return <ViewState onRetry={() => void preview.refetch()} state="error" />;
  return (
    <section>
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-wide text-brand">{t('previewTitle')}</p>
        <h1 className="mt-1 text-3xl font-extrabold text-ink">{t(routeKey)}</h1>
      </div>
      <article className="surface-card p-6" data-mobile-card>
        <div className="flex items-start gap-3">
          <Info aria-hidden className="mt-1 size-5 shrink-0 text-information" />
          <div>
            <h2 className="text-lg font-extrabold text-ink">{t('previewReady')}</h2>
            <p className="mt-2 text-ink-muted">
              {t('previewBody', { message: t(routeKey), records: preview.data.records, sprint })}
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}
