import { ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CheckboxField } from '@/shared/ui/CheckboxField';

interface BlacklistWarningProps {
  customerName?: string;
  acknowledgementId: string;
  reason: string;
}

export function BlacklistWarning({
  acknowledgementId,
  customerName,
  reason,
}: BlacklistWarningProps) {
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
      {customerName ? <p className="mt-2 break-words font-medium">{customerName}</p> : null}
      <p className="mt-1 break-words text-sm">{reason}</p>
      <CheckboxField
        className="mt-3 min-h-touch"
        id={acknowledgementId}
        label={t('acknowledgeWarning')}
      />
    </div>
  );
}
