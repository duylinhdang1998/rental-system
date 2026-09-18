import { useTranslation } from 'react-i18next';
import type { ChargeFieldsProps } from '@/features/contracts/components/settlement/ChargeFields';
import { catalogLocked } from '@/features/contracts/lib/settlement-presentation';
import { TextField } from '@/shared/ui/TextField';

const MIN_DESCRIPTION = 3;
const MAX_DESCRIPTION = 240;

export function ChargeAmountFields({ onChange, values }: ChargeFieldsProps) {
  const { t } = useTranslation();
  const locked = catalogLocked(values.kind, values.damageItemId);
  return (
    <div className="grid gap-4">
      <TextField
        data-dialog-autofocus=""
        id="charge-amount"
        inputMode="numeric"
        label={t('chargeAmount')}
        min={1}
        onChange={(event) => onChange('amount', event.target.value)}
        readOnly={locked}
        required
        type="number"
        value={values.amount}
      />
      <TextField
        id="charge-description"
        label={t('chargeDescription')}
        maxLength={MAX_DESCRIPTION}
        minLength={MIN_DESCRIPTION}
        onChange={(event) => onChange('description', event.target.value)}
        readOnly={locked}
        required
        value={values.description}
      />
    </div>
  );
}
