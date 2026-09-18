import { useTranslation } from 'react-i18next';
import { formatTime, resolveInitialLocale } from '@/shared/i18n/locale';

interface EconomicsHeaderProps {
  generatedAt: string | undefined;
}

export function EconomicsHeader({ generatedAt }: EconomicsHeaderProps) {
  const { i18n, t } = useTranslation();
  const eyebrow = generatedAt
    ? t('reportGeneratedAt', { time: formatTime(generatedAt, resolveInitialLocale(i18n.language)) })
    : t('reports');
  return (
    <header>
      <p className="text-sm font-bold uppercase tracking-wide text-brand-ink">{eyebrow}</p>
      <h1 className="mt-1 text-3xl font-extrabold text-ink">{t('economicsTitle')}</h1>
      <p className="mt-2 text-ink-muted">{t('economicsSubtitle')}</p>
    </header>
  );
}
