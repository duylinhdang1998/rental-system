import type { Vehicle } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { VehicleTableRow } from './VehicleTableRow';

interface VehicleTableProps {
  vehicles: Vehicle[];
}

export function VehicleTable({ vehicles }: VehicleTableProps) {
  const { t } = useTranslation();
  return (
    <div className="surface-card hidden overflow-hidden sm:block">
      <table className="w-full border-collapse text-left">
        <thead className="bg-panel-subtle text-sm text-ink-muted">
          <tr>
            <th className="p-4">{t('vehiclePlate')}</th>
            <th className="p-4">{t('vehicleType')}</th>
            <th className="p-4">{t('vehicleModel')}</th>
            <th className="p-4">{t('status')}</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle) => (
            <VehicleTableRow key={vehicle.id} vehicle={vehicle} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
