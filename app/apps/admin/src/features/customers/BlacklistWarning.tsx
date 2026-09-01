import { ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BlacklistWarningProps {
  reason: string;
}

export function BlacklistWarning({ reason }: BlacklistWarningProps) {
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
      <label className="mt-3 flex min-h-touch cursor-pointer items-center gap-2 text-sm font-bold">
        <input className="size-5 accent-brand" type="checkbox" />
        {t('acknowledgeWarning')}
      </label>
    </div>
  );
}
