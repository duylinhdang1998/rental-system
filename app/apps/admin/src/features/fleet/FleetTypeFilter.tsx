import { useTranslation } from 'react-i18next';

interface FleetTypeFilterProps {
  onChange: (value: string) => void;
  value: string;
}

export function FleetTypeFilter({ onChange, value }: FleetTypeFilterProps) {
  const { t } = useTranslation();
  return (
    <label className="grid gap-2 text-sm font-bold" htmlFor="fleet-type">
      {t('vehicleType')}
      <select
        className="field-control"
        id="fleet-type"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">{t('all')}</option>
        <option value="SCOOTER">SCOOTER</option>
        <option value="MANUAL">MANUAL</option>
      </select>
    </label>
  );
}
