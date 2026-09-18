import { useTranslation } from 'react-i18next';
import { TextField } from '@/shared/ui/TextField';

interface CloseShiftAmountFieldProps {
  onChange: (value: string) => void;
  value: string;
}

export function CloseShiftAmountField({ onChange, value }: CloseShiftAmountFieldProps) {
  const { t } = useTranslation();
  return (
    <TextField
      data-dialog-autofocus=""
      id="cash-shift-counted"
      inputMode="numeric"
      label={t('cashShiftCounted')}
      min={0}
      onChange={(event) => onChange(event.target.value)}
      required
      type="number"
      value={value}
    />
  );
}
