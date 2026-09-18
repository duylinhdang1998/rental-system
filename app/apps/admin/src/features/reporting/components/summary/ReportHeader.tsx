import { useTranslation } from 'react-i18next';
import { formatTime, resolveInitialLocale } from '@/shared/i18n/locale';

interface ReportHeaderProps {
  generatedAt: string | undefined;
}

export function ReportHeader({ generatedAt }: ReportHeaderProps) {
  const { i18n, t } = useTranslation();
  const eyebrow = generatedAt
    ? t('reportGeneratedAt', { time: formatTime(generatedAt, resolveInitialLocale(i18n.language)) })
    : t('reports');
  return (
    <header>
      <p className="text-sm font-bold uppercase tracking-wide text-brand-ink">{eyebrow}</p>
      <h1 className="mt-1 text-3xl font-extrabold text-ink">{t('reportTitle')}</h1>
      <p className="mt-2 text-ink-muted">{t('reportSubtitle')}</p>
    </header>
  );
}
