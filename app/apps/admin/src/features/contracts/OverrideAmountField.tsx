import { useTranslation } from 'react-i18next';

export function OverrideAmountField({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) {
  const { t } = useTranslation();
  return (
    <label className="grid gap-1 text-sm font-bold">
      {t('contractOverrideAmount')}
      <input
        className="field-control"
        min="0"
        onChange={(event) => onChange(event.target.value)}
        type="number"
        value={value}
      />
    </label>
  );
}
