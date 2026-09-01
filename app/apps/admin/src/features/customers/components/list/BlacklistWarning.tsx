import { ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CheckboxField } from '@/shared/ui/CheckboxField';

interface BlacklistWarningProps {
  acknowledgementId: string;
  reason: string;
}

export function BlacklistWarning({ acknowledgementId, reason }: BlacklistWarningProps) {
  const { t } = useTranslation();
  return (
    <div
      className="rounded-control border border-negative bg-negative-soft p-3 text-negative"
      role="alert"
    >
      <div className="flex items-center gap-2 font-extrabold">
        <ShieldAlert aria-hidden className="size-5" />
        {t('blacklistTitle')}
      </div>
      <p className="mt-1 text-sm font-semibold">{reason}</p>
      <CheckboxField
        className="mt-3 min-h-touch"
        id={acknowledgementId}
        label={t('acknowledgeWarning')}
      />
    </div>
  );
}
