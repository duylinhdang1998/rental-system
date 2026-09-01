import type { Vehicle } from '@rental/contracts';
import { useTranslation } from 'react-i18next';

interface Props {
  onToggle: (id: string) => void;
  selected: string[];
  vehicles: Vehicle[];
}

export function ContractVehicleOptions(props: Props) {
  const { t } = useTranslation();
  return (
    <fieldset className="grid gap-3">
      <legend className="mb-2 text-lg font-extrabold">{t('contractVehicles')}</legend>
      {props.vehicles.map((vehicle) => (
        <div
          className={`surface-card flex min-h-touch items-center gap-3 p-4 ${props.selected.includes(vehicle.id) ? 'border-brand bg-brand-soft' : ''}`}
          key={vehicle.id}
        >
          <input
            aria-label={`${vehicle.code} ${vehicle.plate}`}
            checked={props.selected.includes(vehicle.id)}
            disabled={vehicle.status === 'MAINTENANCE' || vehicle.status === 'RETIRED'}
            onChange={() => props.onToggle(vehicle.id)}
            type="checkbox"
          />
          <span>
            <strong>
              {vehicle.code} · {vehicle.plate}
            </strong>
            <small className="block text-ink-muted">
              {vehicle.model} · {t('contractAvailable')}
            </small>
          </span>
        </div>
      ))}
    </fieldset>
  );
}
