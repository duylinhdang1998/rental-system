import { useTranslation } from 'react-i18next';

export function OverrideReasonField({
  amount,
  onChange,
  value,
}: {
  amount: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const { t } = useTranslation();
  return (
    <label className="grid gap-1 text-sm font-bold">
      {t('contractOverrideReason')}
      <input
        className="field-control"
        minLength={3}
        onChange={(event) => onChange(event.target.value)}
        required={Boolean(amount)}
        value={value}
      />
    </label>
  );
}
