import type {
  AvailabilityPeriod,
  Vehicle,
  VehicleInput,
  VehicleStatus,
  VehicleType,
  VehicleTypeInput,
  VehicleStatusHistory,
} from '@rental/contracts';

export interface VehicleQuery {
  search?: string;
  status?: VehicleStatus;
  typeCode?: string;
}

export interface CalendarQuery {
  from: string;
  to: string;
  typeCode?: string;
}

export interface FleetRepository {
  createType(input: VehicleTypeInput): Promise<VehicleType>;
  createVehicle(input: VehicleInput, normalizedPlate: string): Promise<Vehicle>;
  findByPlate(normalizedPlate: string): Promise<Vehicle | null>;
  listTypes(): Promise<VehicleType[]>;
  listVehicles(query: VehicleQuery): Promise<Vehicle[]>;
  periods(vehicle: Vehicle, days: string[]): Promise<AvailabilityPeriod[]>;
  statusHistory(id: string): Promise<VehicleStatusHistory[]>;
  transition(
    id: string,
    status: VehicleStatus,
    actorId: string,
    reason: string,
  ): Promise<Vehicle | null>;
}
