import type { InspectionChargeKind } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { ReturnChargeAmountFields } from '@/features/contracts/components/returns/ReturnChargeAmountFields';
import {
  INSPECTION_CHARGE_KINDS,
  type ReturnFormValues,
} from '@/features/contracts/lib/return-form';
import { SelectField } from '@/shared/ui/SelectField';

export interface ReturnFieldsProps {
  onChange: <TField extends keyof ReturnFormValues>(
    field: TField,
    value: ReturnFormValues[TField],
  ) => void;
  values: ReturnFormValues;
}

/** One optional inspection charge recorded together with the return (damage found at hand-back). */
export function ReturnChargeFields({ onChange, values }: ReturnFieldsProps) {
  const { t } = useTranslation();
  return (
    <fieldset className="grid gap-3 rounded-card border border-line p-3">
      <legend className="px-1 text-sm font-bold text-ink">{t('returnChargeTitle')}</legend>
      <SelectField
        id="return-charge-kind"
        label={t('chargeKind')}
        onChange={(value) => onChange('chargeKind', value as InspectionChargeKind)}
        options={INSPECTION_CHARGE_KINDS.map((kind) => ({
          label: t(`settlementKind.${kind}`),
          value: kind,
        }))}
        value={values.chargeKind}
      />
      <ReturnChargeAmountFields onChange={onChange} values={values} />
    </fieldset>
  );
}
