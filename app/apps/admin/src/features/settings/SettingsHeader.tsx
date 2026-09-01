import { Settings2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function SettingsHeader() {
  const { t } = useTranslation();
  return (
    <header className="flex items-start gap-3">
      <span className="grid size-touch shrink-0 place-items-center rounded-control bg-brand text-panel">
        <Settings2 aria-hidden className="size-5" />
      </span>
      <div>
        <p className="text-sm font-bold text-brand">{t('operationsWorkspace')}</p>
        <h1 className="text-2xl font-extrabold text-ink md:text-3xl">{t('settings')}</h1>
        <p className="mt-1 text-ink-muted">{t('settingsSubtitle')}</p>
      </div>
    </header>
  );
}
