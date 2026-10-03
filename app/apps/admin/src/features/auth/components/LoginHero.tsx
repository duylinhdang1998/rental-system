import { Bike, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BENEFITS = ['loginHeroFleet', 'loginHeroContracts', 'loginHeroFinance'];

export function LoginHero() {
  const { t } = useTranslation();
  return (
    <section className="hidden bg-brand-soft p-12 lg:flex lg:flex-col lg:justify-between">
      <div className="flex items-center gap-3 text-xl font-extrabold text-brand-ink">
        <Bike aria-hidden /> MotoRental
      </div>
      <div className="max-w-lg">
        <p className="mb-5 text-3xl font-semibold leading-tight text-balance text-ink">
          {t('loginHeroTitle')}
        </p>
        <ul className="grid gap-3 text-lg font-semibold text-ink-muted">
          {BENEFITS.map((item) => (
            <li className="flex items-center gap-3" key={item}>
              <CheckCircle2 aria-hidden className="text-positive" />
              {t(item)}
            </li>
          ))}
        </ul>
      </div>
      <p className="text-sm text-ink-muted">{t('loginHeroFooter')}</p>
    </section>
  );
}
