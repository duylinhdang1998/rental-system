import type { Vehicle } from '@rental/contracts';
import { VehicleCard } from '@/features/fleet/components/list/VehicleCard';
import { VehicleTable } from '@/features/fleet/components/list/VehicleTable';

interface VehicleListProps {
  onAcquisition: (vehicle: Vehicle) => void;
  vehicles: Vehicle[];
}

export function VehicleList({ onAcquisition, vehicles }: VehicleListProps) {
  return (
    <div className="grid gap-3">
      {vehicles.map((vehicle) => (
        <VehicleCard
          key={vehicle.id}
          onAcquisition={() => onAcquisition(vehicle)}
          vehicle={vehicle}
        />
      ))}
      <VehicleTable onAcquisition={onAcquisition} vehicles={vehicles} />
    </div>
  );
}
