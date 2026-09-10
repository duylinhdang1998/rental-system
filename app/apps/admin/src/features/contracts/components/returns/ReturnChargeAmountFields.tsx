import { useTranslation } from 'react-i18next';
import type { ReturnFieldsProps } from '@/features/contracts/components/returns/ReturnChargeFields';
import { TextField } from '@/shared/ui/TextField';

const MIN_DESCRIPTION = 3;
const MAX_DESCRIPTION = 240;

export function ReturnChargeAmountFields({ onChange, values }: ReturnFieldsProps) {
  const { t } = useTranslation();
  const hasAmount = Number(values.chargeAmount) > 0;
  return (
    <>
      <TextField
        id="return-charge-amount"
        inputMode="numeric"
        label={t('chargeAmount')}
        min={0}
        onChange={(event) => onChange('chargeAmount', event.target.value)}
        type="number"
        value={values.chargeAmount}
      />
      <TextField
        id="return-charge-description"
        label={t('chargeDescription')}
        maxLength={MAX_DESCRIPTION}
        minLength={MIN_DESCRIPTION}
        onChange={(event) => onChange('chargeDescription', event.target.value)}
        required={hasAmount}
        value={values.chargeDescription}
      />
    </>
  );
}
