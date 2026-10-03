import { FlaskConical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDemoMode } from '@/shared/api/use-demo-mode';

export function DemoBanner() {
  const { t } = useTranslation();
  const demoMode = useDemoMode();
  if (!demoMode) return null;
  return (
    <div className="flex items-center gap-2 border-b border-line bg-caution-soft px-4 py-2 text-xs font-medium text-caution sm:px-5 lg:px-6">
      <FlaskConical aria-hidden className="size-5 shrink-0" />
      <span>{t('demoBanner')}</span>
    </div>
  );
}
