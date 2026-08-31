import { LockKeyhole } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function AccessDeniedPage() {
  const { t } = useTranslation();
  return (
    <section className="surface-card mx-auto mt-12 max-w-xl p-8 text-center">
      <LockKeyhole aria-hidden className="mx-auto mb-4 size-10 text-negative" />
      <h1 className="text-2xl font-extrabold text-ink">{t('accessDeniedTitle')}</h1>
      <p className="mt-2 text-ink-muted">{t('accessDeniedBody')}</p>
    </section>
  );
}
