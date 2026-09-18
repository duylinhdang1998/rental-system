import { useTranslation } from 'react-i18next';
import { formatTime, resolveInitialLocale } from '@/shared/i18n/locale';

interface AnalyticsHeaderProps {
  generatedAt: string | undefined;
  subtitleKey: string;
  titleKey: string;
}

/** Shared by the analytics and profit-and-loss pages: eyebrow, title and one-line scope. */
export function AnalyticsHeader({ generatedAt, subtitleKey, titleKey }: AnalyticsHeaderProps) {
  const { i18n, t } = useTranslation();
  const eyebrow = generatedAt
    ? t('reportGeneratedAt', { time: formatTime(generatedAt, resolveInitialLocale(i18n.language)) })
    : t('reports');
  return (
    <header>
      <p className="text-sm font-bold uppercase tracking-wide text-brand-ink">{eyebrow}</p>
      <h1 className="mt-1 text-3xl font-extrabold text-ink">{t(titleKey)}</h1>
      <p className="mt-2 text-ink-muted">{t(subtitleKey)}</p>
    </header>
  );
}
