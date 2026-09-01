import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { VehicleInput } from '@rental/contracts';
import { createVehicle, fetchVehicles, type FleetFilters } from './fleet-api';

export function useFleet(filters: FleetFilters) {
  return useQuery({ queryFn: () => fetchVehicles(filters), queryKey: ['fleet', filters] });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: VehicleInput) => createVehicle(input),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['fleet'] }),
  });
}
