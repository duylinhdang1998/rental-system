import type { VehicleStatus } from '@rental/contracts';

const MANUAL_TRANSITIONS: Readonly<Record<VehicleStatus, readonly VehicleStatus[]>> = {
  AVAILABLE: ['MAINTENANCE', 'DAMAGED', 'LOST', 'RETIRED'],
  DAMAGED: ['MAINTENANCE', 'AVAILABLE', 'LOST', 'RETIRED'],
  LOST: ['AVAILABLE', 'RETIRED'],
  MAINTENANCE: ['AVAILABLE', 'DAMAGED', 'RETIRED'],
  RENTED: ['MAINTENANCE', 'DAMAGED'],
  RESERVED: ['AVAILABLE'],
  RETIRED: [],
};

export function canTransitionVehicle(from: VehicleStatus, to: VehicleStatus): boolean {
  return MANUAL_TRANSITIONS[from].includes(to);
}
