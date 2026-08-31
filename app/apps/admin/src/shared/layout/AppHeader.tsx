import { Bike } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LocaleToggle } from './LocaleToggle';

export function AppHeader() {
  const { t } = useTranslation();
  return (
    <header className="flex min-h-16 items-center justify-between border-b border-line bg-panel px-4 sm:px-5 lg:px-6">
      <div className="flex items-center gap-2 text-lg font-extrabold text-brand lg:hidden">
        <Bike aria-hidden /> MotoRental
      </div>
      <p className="hidden font-bold text-ink-muted lg:block">{t('operationsWorkspace')}</p>
      <LocaleToggle />
    </header>
  );
}
