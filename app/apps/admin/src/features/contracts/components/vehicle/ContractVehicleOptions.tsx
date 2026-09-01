import type { Vehicle } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { ContractVehicleOption } from './ContractVehicleOption';

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
        <ContractVehicleOption
          key={vehicle.id}
          onToggle={props.onToggle}
          selected={props.selected.includes(vehicle.id)}
          vehicle={vehicle}
        />
      ))}
    </fieldset>
  );
}
