import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type {
  AvailabilityPeriod,
  Vehicle,
  VehicleInput,
  VehicleStatus,
  VehicleType,
  VehicleTypeInput,
  VehicleStatusHistory,
} from '@rental/contracts';
import type { FleetRepository, VehicleQuery } from './fleet.types.js';
import { normalizePlate } from './plate-normalizer.js';
import { ReservationRegistry } from '../../common/reservations/reservation-registry.js';

const SEEDED_TYPES: VehicleType[] = [
  { code: 'SCOOTER', id: 'type-scooter', name: 'Xe tay ga' },
  { code: 'MANUAL', id: 'type-manual', name: 'Xe số' },
];

const SEEDED_VEHICLES: Vehicle[] = [
  {
    code: 'XE-001',
    color: 'Trắng',
    id: 'vehicle-001',
    model: 'Vision',
    plate: '43A1-000.01',
    status: 'AVAILABLE',
    typeCode: 'SCOOTER',
    year: 2025,
  },
  {
    code: 'XE-002',
    color: 'Đen',
    id: 'vehicle-002',
    model: 'Air Blade',
    plate: '43A1-222.22',
    status: 'RENTED',
    typeCode: 'SCOOTER',
    year: 2024,
  },
  {
    code: 'XE-003',
    color: 'Xanh',
    id: 'vehicle-003',
    model: 'Lead',
    plate: '43A1-333.33',
    status: 'RESERVED',
    typeCode: 'SCOOTER',
    year: 2025,
  },
];

@Injectable()
export class DemoFleetRepository implements FleetRepository {
  private readonly types = structuredClone(SEEDED_TYPES);
  private readonly vehicles = structuredClone(SEEDED_VEHICLES);
  private readonly history: VehicleStatusHistory[] = [];

  constructor(private readonly reservations: ReservationRegistry) {}

  createType(input: VehicleTypeInput): Promise<VehicleType> {
    const created = { ...input, id: randomUUID() };
    this.types.push(created);
    return Promise.resolve(created);
  }

  createVehicle(input: VehicleInput, normalizedPlate: string): Promise<Vehicle> {
    void normalizedPlate;
    const created: Vehicle = { ...input, id: randomUUID(), status: 'AVAILABLE' };
    this.vehicles.push(created);
    return Promise.resolve(created);
  }

  findByPlate(normalizedPlate: string): Promise<Vehicle | null> {
    return Promise.resolve(
      this.vehicles.find((vehicle) => normalizePlate(vehicle.plate) === normalizedPlate) ?? null,
    );
  }

  listTypes(): Promise<VehicleType[]> {
    return Promise.resolve(structuredClone(this.types));
  }

  listVehicles(query: VehicleQuery): Promise<Vehicle[]> {
    return Promise.resolve(
      this.vehicles.filter((vehicle) => this.matches(vehicle, query)).map((item) => ({ ...item })),
    );
  }

  periods(vehicle: Vehicle, days: string[]): Promise<AvailabilityPeriod[]> {
    return Promise.resolve(
      days.map((date, index) => ({
        date,
        state: this.reservations.state(vehicle.id, date) ?? this.periodState(vehicle.status, index),
      })),
    );
  }

  statusHistory(id: string): Promise<VehicleStatusHistory[]> {
    return Promise.resolve(this.history.filter((item) => item.id.startsWith(`${id}:`)));
  }

  transition(
    id: string,
    status: VehicleStatus,
    actorId: string,
    reason: string,
  ): Promise<Vehicle | null> {
    const vehicle = this.vehicles.find((item) => item.id === id);
    if (!vehicle) return Promise.resolve(null);
    this.history.push({
      actorId,
      at: new Date().toISOString(),
      from: vehicle.status,
      id: `${id}:${this.history.length}`,
      reason,
      to: status,
    });
    vehicle.status = status;
    return Promise.resolve({ ...vehicle });
  }

  private matches(vehicle: Vehicle, query: VehicleQuery): boolean {
    const search = query.search?.toLowerCase();
    const matchesSearch =
      !search || `${vehicle.code} ${vehicle.plate} ${vehicle.model}`.toLowerCase().includes(search);
    return (
      matchesSearch &&
      (!query.status || vehicle.status === query.status) &&
      (!query.typeCode || vehicle.typeCode === query.typeCode)
    );
  }

  private periodState(status: VehicleStatus, index: number): AvailabilityPeriod['state'] {
    if (status === 'RENTED') return index < 2 ? 'RENTED' : 'AVAILABLE';
    if (status === 'RESERVED') return index === 0 ? 'HELD' : 'AVAILABLE';
    return 'AVAILABLE';
  }
}
