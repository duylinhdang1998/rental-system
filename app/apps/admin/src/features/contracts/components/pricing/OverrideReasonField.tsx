import { useTranslation } from 'react-i18next';
import { TextField } from '@/shared/ui/TextField';

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
    <TextField
      id="contract-override-reason"
      label={t('contractOverrideReason')}
      minLength={3}
      onChange={(event) => onChange(event.target.value)}
      required={Boolean(amount)}
      value={value}
    />
  );
}
