import type { ContractLine, ManualChargeKind } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { DamageItemSelect } from '@/features/contracts/components/returns/DamageItemSelect';
import { ChargeLineField } from '@/features/contracts/components/settlement/ChargeLineField';
import {
  applyChargeItem,
  type ChargeFieldChange,
  type ChargeFormValues,
} from '@/features/contracts/lib/settlement-presentation';
import { SelectField } from '@/shared/ui/SelectField';

export interface ChargeFieldsProps {
  onChange: ChargeFieldChange;
  values: ChargeFormValues;
}

interface ChargeKindFieldsProps extends ChargeFieldsProps {
  kinds: ManualChargeKind[];
  lines: ContractLine[];
}

export function ChargeFields({ kinds, lines, onChange, values }: ChargeKindFieldsProps) {
  const { t } = useTranslation();
  const changeKind = (kind: ManualChargeKind) => {
    onChange('kind', kind);
    if (kind !== 'DAMAGE') applyChargeItem(onChange, null);
  };
  return (
    <div className="grid gap-4">
      <SelectField
        id="charge-kind"
        label={t('chargeKind')}
        onChange={(value) => changeKind(value as ManualChargeKind)}
        options={kinds.map((kind) => ({ label: t(`settlementKind.${kind}`), value: kind }))}
        value={values.kind}
      />
      {values.kind === 'DAMAGE' ? (
        <DamageItemSelect
          id="charge-damage-item"
          onSelect={(item) => applyChargeItem(onChange, item)}
          value={values.damageItemId}
        />
      ) : null}
      <ChargeLineField
        lines={lines}
        onChange={(lineId) => onChange('lineId', lineId)}
        value={values.lineId}
      />
    </div>
  );
}
