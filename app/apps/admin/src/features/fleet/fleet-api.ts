import {
  fleetCalendarSchema,
  vehicleListSchema,
  vehicleSchema,
  type FleetCalendar,
  type Vehicle,
  type VehicleInput,
  type VehicleStatus,
} from '@rental/contracts';
import { apiRequest } from '../../shared/api/http';

export interface FleetFilters {
  search?: string;
  status?: VehicleStatus;
  typeCode?: string;
}

export async function fetchVehicles(filters: FleetFilters): Promise<{ items: Vehicle[] }> {
  const query = new URLSearchParams();
  if (filters.search) query.set('search', filters.search);
  if (filters.status) query.set('status', filters.status);
  if (filters.typeCode) query.set('typeCode', filters.typeCode);
  return vehicleListSchema.parse(await apiRequest(`/api/fleet/vehicles?${query.toString()}`));
}

export async function fetchCalendar(
  from: string,
  to: string,
  typeCode?: string,
): Promise<FleetCalendar> {
  const query = new URLSearchParams({ from, to });
  if (typeCode) query.set('typeCode', typeCode);
  return fleetCalendarSchema.parse(await apiRequest(`/api/fleet/calendar?${query.toString()}`));
}

export async function createVehicle(input: VehicleInput): Promise<Vehicle> {
  const payload = await apiRequest('/api/fleet/vehicles', {
    body: JSON.stringify(input),
    method: 'POST',
  });
  return vehicleSchema.parse(payload);
}

export type { FleetCalendar };
