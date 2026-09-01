import { useTranslation } from 'react-i18next';
import { SelectField } from '@/shared/ui/SelectField';

interface FleetStatusFilterProps {
  onChange: (value: string) => void;
  value: string;
}

export function FleetStatusFilter({ onChange, value }: FleetStatusFilterProps) {
  const { t } = useTranslation();
  return (
    <SelectField
      id="fleet-status"
      label={t('status')}
      onChange={onChange}
      options={[
        { label: t('all'), value: '' },
        { label: t('vehicleStatus.AVAILABLE'), value: 'AVAILABLE' },
        { label: t('vehicleStatus.RENTED'), value: 'RENTED' },
        { label: t('vehicleStatus.MAINTENANCE'), value: 'MAINTENANCE' },
      ]}
      value={value}
    />
  );
}
