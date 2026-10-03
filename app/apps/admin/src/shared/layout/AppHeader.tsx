import { Bike } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MobileMenu } from '@/shared/layout/MobileMenu';
import { LocaleToggle } from '@/shared/layout/LocaleToggle';
import { PrimaryColorSelect } from '@/shared/layout/PrimaryColorSelect';

export function AppHeader() {
  const { t } = useTranslation();
  return (
    <header className="flex min-h-16 items-center justify-between border-b border-line bg-panel px-4 sm:px-5 lg:px-6">
      <div className="flex min-w-0 items-center gap-1 lg:hidden">
        <MobileMenu />
        <Link
          aria-label="MotoRental"
          className="inline-flex min-h-touch items-center gap-2 text-base font-semibold text-brand-ink"
          to="/"
        >
          <Bike aria-hidden className="size-5 shrink-0" />
          <span className="hidden min-[400px]:inline">MotoRental</span>
        </Link>
      </div>
      <p className="hidden font-bold text-ink-muted lg:block">{t('operationsWorkspace')}</p>
      <div className="flex shrink-0 items-center gap-2">
        <PrimaryColorSelect />
        <LocaleToggle />
      </div>
    </header>
  );
}
