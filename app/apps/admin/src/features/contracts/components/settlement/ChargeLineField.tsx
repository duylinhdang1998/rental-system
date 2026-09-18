import type { ContractLine } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { SelectField } from '@/shared/ui/SelectField';

interface ChargeLineFieldProps {
  lines: ContractLine[];
  onChange: (lineId: string) => void;
  value: string;
}

/** A charge applies to one vehicle line or to the whole contract. */
export function ChargeLineField({ lines, onChange, value }: ChargeLineFieldProps) {
  const { t } = useTranslation();
  return (
    <SelectField
      id="charge-line"
      label={t('chargeLine')}
      onChange={onChange}
      options={[
        { label: t('chargeWholeContract'), value: '' },
        ...lines.map((line) => ({ label: line.vehicleCode, value: line.id })),
      ]}
      value={value}
    />
  );
}
