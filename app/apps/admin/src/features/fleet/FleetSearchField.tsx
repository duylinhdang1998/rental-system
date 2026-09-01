import { useTranslation } from 'react-i18next';

interface FleetSearchFieldProps {
  onChange: (value: string) => void;
  value: string;
}

export function FleetSearchField({ onChange, value }: FleetSearchFieldProps) {
  const { t } = useTranslation();
  return (
    <label className="grid gap-2 text-sm font-bold" htmlFor="fleet-search">
      {t('search')}
      <input
        aria-label={t('searchVehicles')}
        className="field-control"
        id="fleet-search"
        onChange={(event) => onChange(event.target.value)}
        type="search"
        value={value}
      />
    </label>
  );
}
