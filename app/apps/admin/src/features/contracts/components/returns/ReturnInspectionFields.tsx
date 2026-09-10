import type { ReturnCondition } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import type { ReturnFieldsProps } from '@/features/contracts/components/returns/ReturnChargeFields';
import { RETURN_CONDITIONS } from '@/features/contracts/lib/return-form';
import { SelectField } from '@/shared/ui/SelectField';
import { TextField } from '@/shared/ui/TextField';

const MAX_PERCENT = 100;

export function ReturnInspectionFields({ onChange, values }: ReturnFieldsProps) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4">
      <SelectField
        id="return-condition"
        label={t('returnCondition')}
        onChange={(value) => onChange('condition', value as ReturnCondition)}
        options={RETURN_CONDITIONS.map((condition) => ({
          label: t(`returnConditionOption.${condition}`),
          value: condition,
        }))}
        value={values.condition}
      />
      <TextField
        id="return-fuel"
        inputMode="numeric"
        label={t('returnFuel')}
        max={MAX_PERCENT}
        min={0}
        onChange={(event) => onChange('fuelPercent', event.target.value)}
        required
        type="number"
        value={values.fuelPercent}
      />
    </div>
  );
}
