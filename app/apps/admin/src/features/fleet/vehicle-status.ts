import type { VehicleStatus } from '@rental/contracts';

export type VehicleStatusTone = 'danger' | 'info' | 'success' | 'warning';

export function vehicleStatusTone(status: VehicleStatus): VehicleStatusTone {
  if (status === 'AVAILABLE') return 'success';
  if (status === 'DAMAGED' || status === 'LOST') return 'danger';
  if (status === 'RENTED') return 'info';
  return 'warning';
}
