import { useTranslation } from 'react-i18next';
import { SelectField } from '@/shared/ui/SelectField';

interface FleetTypeFilterProps {
  onChange: (value: string) => void;
  value: string;
}

export function FleetTypeFilter({ onChange, value }: FleetTypeFilterProps) {
  const { t } = useTranslation();
  return (
    <SelectField
      id="fleet-type"
      label={t('vehicleType')}
      onChange={onChange}
      options={[
        { label: t('all'), value: '' },
        { label: 'SCOOTER', value: 'SCOOTER' },
        { label: 'MANUAL', value: 'MANUAL' },
      ]}
      value={value}
    />
  );
}
