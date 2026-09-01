import { Clock3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDateTime, resolveInitialLocale } from '@/shared/i18n/locale';

export function LateReturnSettingsHeader({ createdAt }: { createdAt: string }) {
  const { i18n, t } = useTranslation();
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-touch shrink-0 place-items-center rounded-control bg-brand-soft text-brand">
        <Clock3 aria-hidden className="size-5" />
      </span>
      <div>
        <h2 className="text-xl font-extrabold text-ink">{t('lateReturnSettingsTitle')}</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-muted">
          {t('lateReturnSettingsHelp')}
        </p>
        <p className="mt-2 text-sm font-semibold text-ink-muted">
          {t('createdAt')}: {formatDateTime(createdAt, resolveInitialLocale(i18n.language))}
        </p>
      </div>
    </div>
  );
}
