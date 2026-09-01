import { useTranslation } from 'react-i18next';

interface FleetStatusFilterProps {
  onChange: (value: string) => void;
  value: string;
}

export function FleetStatusFilter({ onChange, value }: FleetStatusFilterProps) {
  const { t } = useTranslation();
  return (
    <label className="grid gap-2 text-sm font-bold" htmlFor="fleet-status">
      {t('status')}
      <select
        className="field-control"
        id="fleet-status"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">{t('all')}</option>
        <option value="AVAILABLE">{t('vehicleStatus.AVAILABLE')}</option>
        <option value="RENTED">{t('vehicleStatus.RENTED')}</option>
        <option value="MAINTENANCE">{t('vehicleStatus.MAINTENANCE')}</option>
      </select>
    </label>
  );
}
