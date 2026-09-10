import type { ContractLine, ManualChargeKind } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import type { ChargeFormValues } from '@/features/contracts/lib/settlement-presentation';
import { SelectField } from '@/shared/ui/SelectField';

export interface ChargeFieldsProps {
  onChange: <TField extends keyof ChargeFormValues>(
    field: TField,
    value: ChargeFormValues[TField],
  ) => void;
  values: ChargeFormValues;
}

interface ChargeKindFieldsProps extends ChargeFieldsProps {
  kinds: ManualChargeKind[];
  lines: ContractLine[];
}

export function ChargeFields({ kinds, lines, onChange, values }: ChargeKindFieldsProps) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4">
      <SelectField
        id="charge-kind"
        label={t('chargeKind')}
        onChange={(value) => onChange('kind', value as ManualChargeKind)}
        options={kinds.map((kind) => ({ label: t(`settlementKind.${kind}`), value: kind }))}
        value={values.kind}
      />
      <SelectField
        id="charge-line"
        label={t('chargeLine')}
        onChange={(value) => onChange('lineId', value)}
        options={[
          { label: t('chargeWholeContract'), value: '' },
          ...lines.map((line) => ({ label: line.vehicleCode, value: line.id })),
        ]}
        value={values.lineId}
      />
    </div>
  );
}
