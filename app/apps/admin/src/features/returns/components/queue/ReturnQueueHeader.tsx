import { useTranslation } from 'react-i18next';
import { formatTime, resolveInitialLocale } from '@/shared/i18n/locale';

interface ReturnQueueHeaderProps {
  generatedAt: string;
}

export function ReturnQueueHeader({ generatedAt }: ReturnQueueHeaderProps) {
  const { i18n, t } = useTranslation();
  return (
    <header>
      <p className="text-sm font-bold uppercase tracking-wide text-brand-ink">
        {t('returnQueueUpdated', {
          time: formatTime(generatedAt, resolveInitialLocale(i18n.language)),
        })}
      </p>
      <h1 className="mt-1 text-3xl font-extrabold text-ink">{t('returns')}</h1>
      <p className="mt-2 text-ink-muted">{t('returnQueueSubtitle')}</p>
    </header>
  );
}
