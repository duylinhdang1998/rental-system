import { Bike } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LocaleToggle } from '@/shared/layout/LocaleToggle';
import { DemoCredentials } from '@/features/auth/components/DemoCredentials';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { LoginHero } from '@/features/auth/components/LoginHero';

export function LoginPage() {
  const { t } = useTranslation();
  return (
    <main className="grid min-h-screen bg-app lg:grid-cols-2">
      <LoginHero />
      <section className="relative flex flex-col items-center justify-center gap-6 p-4 sm:p-8">
        <div className="flex w-full max-w-md justify-end">
          <LocaleToggle />
        </div>
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-2 text-lg font-semibold text-brand-ink lg:hidden">
            <Bike aria-hidden /> MotoRental
          </div>
          <h1 className="type-h1 text-ink">{t('loginTitle')}</h1>
          <p className="mb-6 mt-2 text-ink-muted">{t('loginSubtitle')}</p>
          <LoginForm />
          <DemoCredentials />
        </div>
      </section>
    </main>
  );
}
