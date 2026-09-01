import { useTranslation } from 'react-i18next';
import { SelectField } from '@/shared/ui/SelectField';

interface VehicleTypeFieldProps {
  onChange: (value: string) => void;
  value: string;
}

export function VehicleTypeField({ onChange, value }: VehicleTypeFieldProps) {
  const { t } = useTranslation();
  return (
    <SelectField
      id="vehicle-type"
      label={t('vehicleType')}
      onChange={onChange}
      options={[
        { label: 'SCOOTER', value: 'SCOOTER' },
        { label: 'MANUAL', value: 'MANUAL' },
      ]}
      value={value}
    />
  );
}
