import type { InspectionChargeKind } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { DamageItemSelect } from '@/features/contracts/components/returns/DamageItemSelect';
import { ReturnChargeAmountFields } from '@/features/contracts/components/returns/ReturnChargeAmountFields';
import {
  INSPECTION_CHARGE_KINDS,
  applyDamageItem,
  type ReturnFieldChange,
  type ReturnFormValues,
} from '@/features/contracts/lib/return-form';
import { SelectField } from '@/shared/ui/SelectField';

export interface ReturnFieldsProps {
  onChange: ReturnFieldChange;
  values: ReturnFormValues;
}

/** One optional inspection charge recorded together with the return (damage found at hand-back). */
export function ReturnChargeFields({ onChange, values }: ReturnFieldsProps) {
  const { t } = useTranslation();
  const changeKind = (kind: InspectionChargeKind) => {
    onChange('chargeKind', kind);
    if (kind !== 'DAMAGE') applyDamageItem(onChange, null);
  };
  return (
    <fieldset className="grid gap-3 rounded-card border border-line p-3">
      <legend className="px-1 text-sm font-bold text-ink">{t('returnChargeTitle')}</legend>
      <SelectField
        id="return-charge-kind"
        label={t('chargeKind')}
        onChange={(value) => changeKind(value as InspectionChargeKind)}
        options={INSPECTION_CHARGE_KINDS.map((kind) => ({
          label: t(`settlementKind.${kind}`),
          value: kind,
        }))}
        value={values.chargeKind}
      />
      {values.chargeKind === 'DAMAGE' ? (
        <DamageItemSelect
          id="return-damage-item"
          onSelect={(item) => applyDamageItem(onChange, item)}
          value={values.damageItemId}
        />
      ) : null}
      <ReturnChargeAmountFields onChange={onChange} values={values} />
    </fieldset>
  );
}
