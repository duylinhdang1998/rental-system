import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import type {
  VehicleAcquisition,
  VehicleAcquisitionInput,
  VehicleAcquisitionView,
} from '@rental/contracts';
import { fetchAcquisition, saveAcquisition } from '@/features/fleet/api/fleet-api';

export function useVehicleAcquisition(
  vehicleId: string,
): UseQueryResult<VehicleAcquisitionView, Error> {
  return useQuery({
    queryFn: () => fetchAcquisition(vehicleId),
    queryKey: ['acquisition', vehicleId],
  });
}

export function useSaveAcquisition(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation<VehicleAcquisition, Error, VehicleAcquisitionInput>({
    mutationFn: (input) => saveAcquisition(vehicleId, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['acquisition', vehicleId] }),
        queryClient.invalidateQueries({ queryKey: ['fleet-economics'] }),
      ]);
    },
  });
}
