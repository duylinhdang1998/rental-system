import { useTranslation } from 'react-i18next';
import { formatTime, resolveInitialLocale } from '@/shared/i18n/locale';

interface ReturnQueueHeaderProps {
  generatedAt?: string;
}

export function ReturnQueueHeader({ generatedAt }: ReturnQueueHeaderProps) {
  const { i18n, t } = useTranslation();
  return (
    <header>
      <p className="text-sm font-bold uppercase tracking-wide text-brand-ink">
        {generatedAt ? (
          t('returnQueueUpdated', {
            time: formatTime(generatedAt, resolveInitialLocale(i18n.language)),
          })
        ) : (
          <span aria-hidden className="block h-5 w-32 rounded bg-muted" />
        )}
      </p>
      <h1 className="mt-1 type-h1 text-ink">{t('returns')}</h1>
      <p className="mt-2 text-ink-muted">{t('returnQueueSubtitle')}</p>
    </header>
  );
}
