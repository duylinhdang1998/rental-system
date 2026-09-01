import { useTranslation } from 'react-i18next';

interface VehicleTypeFieldProps {
  onChange: (value: string) => void;
  value: string;
}

export function VehicleTypeField({ onChange, value }: VehicleTypeFieldProps) {
  const { t } = useTranslation();
  return (
    <label className="grid gap-2 text-sm font-bold" htmlFor="vehicle-type">
      {t('vehicleType')}
      <select
        className="field-control"
        id="vehicle-type"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="SCOOTER">SCOOTER</option>
        <option value="MANUAL">MANUAL</option>
      </select>
    </label>
  );
}
