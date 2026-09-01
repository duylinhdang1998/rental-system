import { useTranslation } from 'react-i18next';
import { TextField } from '@/shared/ui/TextField';

export function OverrideAmountField({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) {
  const { t } = useTranslation();
  return (
    <TextField
      id="contract-override-amount"
      label={t('contractOverrideAmount')}
      min="0"
      onChange={(event) => onChange(event.target.value)}
      type="number"
      value={value}
    />
  );
}
