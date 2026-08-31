import { FlaskConical } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function DemoBanner() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2 border-b border-caution bg-caution-soft px-4 py-3 text-sm font-bold text-caution sm:px-5 lg:px-6">
      <FlaskConical aria-hidden className="size-5 shrink-0" />
      <span>{t('demoBanner')}</span>
    </div>
  );
}
