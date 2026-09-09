import { useQuery } from '@tanstack/react-query';
import type { ContractLine, Vehicle } from '@rental/contracts';
import { fetchVehicles } from '@/features/fleet/api/fleet-api';

const SWAPPABLE_STATUSES: Vehicle['status'][] = ['AVAILABLE', 'RESERVED'];

export function useSwapCandidates(line: ContractLine | undefined): Vehicle[] {
  const fleet = useQuery({ queryFn: () => fetchVehicles({}), queryKey: ['fleet', {}] });
  const vehicles = fleet.data?.items ?? [];
  const current = vehicles.find((vehicle) => vehicle.id === line?.vehicleId);
  return vehicles.filter(
    (vehicle) =>
      vehicle.id !== line?.vehicleId &&
      (!current || vehicle.typeCode === current.typeCode) &&
      SWAPPABLE_STATUSES.includes(vehicle.status),
  );
}
