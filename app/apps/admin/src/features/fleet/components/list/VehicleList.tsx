import type { Vehicle } from '@rental/contracts';
import { VehicleCard } from '@/features/fleet/components/list/VehicleCard';
import { VehicleTable } from '@/features/fleet/components/list/VehicleTable';

interface VehicleListProps {
  vehicles: Vehicle[];
}

export function VehicleList({ vehicles }: VehicleListProps) {
  return (
    <div className="grid gap-3">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
      <VehicleTable vehicles={vehicles} />
    </div>
  );
}
