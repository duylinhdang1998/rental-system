import { Inject, Injectable } from '@nestjs/common';
import {
  ISO_DATE_LENGTH,
  MILLISECONDS_PER_DAY,
  type AuthenticatedUser,
  type VehicleInput,
  type VehicleTransitionInput,
  type VehicleTypeInput,
} from '@rental/contracts';
import { AuditService } from '../../common/audit/audit.service.js';
import { DomainError } from '../../common/errors/domain.error.js';
import { FLEET_REPOSITORY } from './fleet.tokens.js';
import type { CalendarQuery, FleetRepository, VehicleQuery } from './fleet.types.js';
import { normalizePlate } from './plate-normalizer.js';
import { canTransitionVehicle } from './vehicle-transition.policy.js';

const MAX_CALENDAR_DAYS = 62;

@Injectable()
export class FleetService {
  constructor(
    @Inject(FLEET_REPOSITORY) private readonly repository: FleetRepository,
    private readonly audit: AuditService,
  ) {}

  async createType(input: VehicleTypeInput, actor: AuthenticatedUser) {
    const created = await this.repository.createType(input);
    await this.record('VEHICLE_TYPE_CREATED', actor.id, created.id, 'VehicleType');
    return created;
  }

  async createVehicle(input: VehicleInput, actor: AuthenticatedUser) {
    const plate = normalizePlate(input.plate);
    if (await this.repository.findByPlate(plate)) {
      throw new DomainError('CONFLICT', 'Biển số xe đã tồn tại');
    }
    const created = await this.repository.createVehicle(input, plate);
    await this.record('VEHICLE_CREATED', actor.id, created.id, 'Vehicle');
    return created;
  }

  listTypes() {
    return this.repository.listTypes();
  }

  async listVehicles(query: VehicleQuery) {
    return { items: await this.repository.listVehicles(query) };
  }

  async calendar(query: CalendarQuery) {
    const days = this.calendarDays(query.from, query.to);
    const vehicles = await this.repository.listVehicles({ typeCode: query.typeCode });
    const rows = await Promise.all(
      vehicles.map(async (vehicle) => ({
        code: vehicle.code,
        id: vehicle.id,
        periods: await this.repository.periods(vehicle, days),
        plate: vehicle.plate,
      })),
    );
    return { days, vehicles: rows };
  }

  statusHistory(id: string) {
    return this.repository.statusHistory(id);
  }

  async transition(id: string, input: VehicleTransitionInput, actor: AuthenticatedUser) {
    const current = (await this.repository.listVehicles({})).find((vehicle) => vehicle.id === id);
    if (!current) throw new DomainError('NOT_FOUND', 'Không tìm thấy xe');
    if (!canTransitionVehicle(current.status, input.status)) {
      throw new DomainError('INVALID_TRANSITION', 'Không thể chuyển sang trạng thái này thủ công');
    }
    const updated = await this.repository.transition(id, input.status, actor.id, input.reason);
    await this.record('VEHICLE_STATUS_CHANGED', actor.id, id, 'Vehicle');
    return updated;
  }

  private calendarDays(from: string, to: string): string[] {
    const start = Date.parse(`${from}T00:00:00.000Z`);
    const end = Date.parse(`${to}T00:00:00.000Z`);
    const count = Math.floor((end - start) / MILLISECONDS_PER_DAY) + 1;
    if (
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      count < 1 ||
      count > MAX_CALENDAR_DAYS
    ) {
      throw new DomainError('CONFLICT', 'Khoảng ngày lịch không hợp lệ');
    }
    return Array.from({ length: count }, (_, index) =>
      new Date(start + index * MILLISECONDS_PER_DAY).toISOString().slice(0, ISO_DATE_LENGTH),
    );
  }

  private record(
    action: string,
    actorId: string,
    entityId: string,
    entityType: string,
  ): Promise<void> {
    return this.audit.record({ action, actorId, entityId, entityType });
  }
}
