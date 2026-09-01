import { FilePlus2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate, resolveInitialLocale } from '@/shared/i18n/locale';
import { Button } from '@/components/ui/button';

const DEMO_DATE = new Date('2026-08-31T00:00:00+07:00');

export function DashboardHeader() {
  const { i18n, t } = useTranslation();
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-brand">
          {formatDate(DEMO_DATE, resolveInitialLocale(i18n.language))}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold text-ink">{t('dashboardTitle')}</h1>
        <p className="mt-2 text-ink-muted">{t('dashboardGreeting')}</p>
      </div>
      <Button disabled title="Sprint 3" type="button">
        <FilePlus2 aria-hidden data-icon="inline-start" />
        {t('createContract')}
      </Button>
    </header>
  );
}
