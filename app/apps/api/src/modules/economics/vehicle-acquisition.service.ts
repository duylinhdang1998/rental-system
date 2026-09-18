import { Inject, Injectable } from '@nestjs/common';
import type {
  AuthenticatedUser,
  Vehicle,
  VehicleAcquisition,
  VehicleAcquisitionInput,
  VehicleAcquisitionView,
} from '@rental/contracts';
import { AuditService } from '../../common/audit/audit.service.js';
import { DomainError } from '../../common/errors/domain.error.js';
import { FLEET_REPOSITORY } from '../fleet/fleet.tokens.js';
import type { FleetRepository } from '../fleet/fleet.types.js';
import { ECONOMICS_REPOSITORY } from './economics.tokens.js';
import type { EconomicsRepository } from './economics.types.js';

const ENTITY_TYPE = 'VehicleAcquisition';

/** US-023: the Owner prices a vehicle once; later changes overwrite it and the audit keeps both prices. */
@Injectable()
export class VehicleAcquisitionService {
  constructor(
    @Inject(ECONOMICS_REPOSITORY) private readonly repository: EconomicsRepository,
    @Inject(FLEET_REPOSITORY) private readonly fleet: FleetRepository,
    private readonly audit: AuditService,
  ) {}

  async get(vehicleId: string): Promise<VehicleAcquisitionView> {
    const vehicle = await this.requireVehicle(vehicleId);
    return {
      acquisition: await this.repository.findAcquisition(vehicle.id),
      vehicleId: vehicle.id,
    };
  }

  async set(
    vehicleId: string,
    input: VehicleAcquisitionInput,
    actor: AuthenticatedUser,
  ): Promise<VehicleAcquisition> {
    const vehicle = await this.requireVehicle(vehicleId);
    const before = await this.repository.findAcquisition(vehicle.id);
    const stored = await this.repository.upsertAcquisition({
      ...input,
      updatedById: actor.id,
      vehicleId: vehicle.id,
    });
    await this.audit.record({
      action: 'VEHICLE_ACQUISITION_SET',
      actorId: actor.id,
      entityId: vehicle.id,
      entityType: ENTITY_TYPE,
      metadata: {
        afterPriceVnd: stored.purchasePriceVnd,
        beforePriceVnd: before?.purchasePriceVnd ?? 0,
        usefulLifeMonths: stored.usefulLifeMonths,
        vehicleCode: vehicle.code,
      },
    });
    return stored;
  }

  private async requireVehicle(vehicleId: string): Promise<Vehicle> {
    const vehicle = await this.fleet.findById(vehicleId);
    if (!vehicle) throw new DomainError('NOT_FOUND', 'Không tìm thấy xe');
    return vehicle;
  }
}
