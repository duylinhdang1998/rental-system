import { VehicleDetailDialog } from '@/features/fleet/components/list/VehicleDetailDialog';
import type { Vehicle } from '@rental/contracts';
import { useSelection } from '@/shared/hooks/use-selection';
import { VehicleCard } from '@/features/fleet/components/list/VehicleCard';
import { VehicleTable } from '@/features/fleet/components/list/VehicleTable';

interface VehicleListProps {
  onAcquisition: (vehicle: Vehicle) => void;
  vehicles: Vehicle[];
}

export function VehicleList({ onAcquisition, vehicles }: VehicleListProps) {
  const { selected, select: setSelected } = useSelection<Vehicle>();
  return (
    <div className="grid gap-3">
      {vehicles.map((vehicle) => (
        <VehicleCard
          key={vehicle.id}
          onAcquisition={() => onAcquisition(vehicle)}
          onDetails={() => setSelected(vehicle)}
          vehicle={vehicle}
        />
      ))}
      <VehicleTable onAcquisition={onAcquisition} onDetails={setSelected} vehicles={vehicles} />
      {selected ? (
        <VehicleDetailDialog vehicle={selected} onClose={() => setSelected(null)} />
      ) : null}
    </div>
  );
}
