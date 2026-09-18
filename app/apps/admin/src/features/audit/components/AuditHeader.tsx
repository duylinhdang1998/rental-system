import { useTranslation } from 'react-i18next';

interface AuditHeaderProps {
  count: number;
}

export function AuditHeader({ count }: AuditHeaderProps) {
  const { t } = useTranslation();
  return (
    <header>
      <p className="text-sm font-bold uppercase tracking-wide text-brand-ink">
        {t('auditCount', { count })}
      </p>
      <h1 className="mt-1 text-3xl font-extrabold text-ink">{t('audit')}</h1>
      <p className="mt-2 text-ink-muted">{t('auditSubtitle')}</p>
    </header>
  );
}
