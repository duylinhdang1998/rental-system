import type { Vehicle } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from '../../shared/ui/StatusBadge';
import { vehicleStatusTone } from './vehicle-status';

interface VehicleTableRowProps {
  vehicle: Vehicle;
}

export function VehicleTableRow({ vehicle }: VehicleTableRowProps) {
  const { t } = useTranslation();
  return (
    <tr className="border-t border-line">
      <td className="p-4 font-extrabold">
        {vehicle.plate}
        <span className="block text-xs font-semibold text-ink-muted">{vehicle.code}</span>
      </td>
      <td className="p-4">{vehicle.typeCode}</td>
      <td className="p-4">{vehicle.model}</td>
      <td className="p-4">
        <StatusBadge
          label={t(`vehicleStatus.${vehicle.status}`)}
          tone={vehicleStatusTone(vehicle.status)}
        />
      </td>
    </tr>
  );
}
