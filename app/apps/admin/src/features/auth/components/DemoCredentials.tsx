import { useTranslation } from 'react-i18next';
import { useDemoMode } from '@/shared/api/use-demo-mode';

export function DemoCredentials() {
  const { t } = useTranslation();
  const demoMode = useDemoMode();
  if (!demoMode) return null;
  return (
    <div className="mt-6 rounded-card border border-line bg-panel p-4 text-sm">
      <p className="font-medium text-ink">{t('demoData')}</p>
      <p className="mt-2 text-ink-muted">
        {t('roles.OWNER')}: <code className="break-all text-ink">owner / OwnerDemo!2026</code>
      </p>
      <p className="mt-2 text-ink-muted">
        {t('roles.STAFF')}: <code className="break-all text-ink">staff / StaffDemo!2026</code>
      </p>
    </div>
  );
}
