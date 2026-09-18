import { Inject, Injectable } from '@nestjs/common';
import type { RentalContract, VehicleStatus } from '@rental/contracts';
import { FLEET_REPOSITORY } from '../fleet/fleet.tokens.js';
import type { FleetRepository } from '../fleet/fleet.types.js';
import { canTransitionVehicle } from '../fleet/vehicle-transition.policy.js';
import { CONTRACT_REPOSITORY } from './contract.tokens.js';
import type { ContractRepository } from './contract.types.js';

/** Only schedule-driven statuses are touched; manual states (maintenance, damaged…) are kept. */
const OPERATIONAL_STATUSES: readonly VehicleStatus[] = ['AVAILABLE', 'RESERVED', 'RENTED'];

@Injectable()
export class VehicleSyncService {
  constructor(
    @Inject(FLEET_REPOSITORY) private readonly fleet: FleetRepository,
    @Inject(CONTRACT_REPOSITORY) private readonly contracts: ContractRepository,
  ) {}

  /** BR-02: derive each vehicle's operational status from the contracts still holding it. */
  async sync(contract: RentalContract, actorId: string, vehicleIds?: string[]): Promise<void> {
    const ids = new Set(vehicleIds ?? contract.quote.lines.map((line) => line.vehicleId));
    for (const vehicleId of ids) {
      await this.syncVehicle(vehicleId, actorId, `Hợp đồng ${contract.code}`);
    }
  }

  /** BR-02: a damaged or worn vehicle leaves the rental flow before the schedule sync runs. */
  async parkAfterReturn(
    contract: RentalContract,
    vehicleId: string,
    target: VehicleStatus | null,
    actorId: string,
  ): Promise<void> {
    if (target) {
      const vehicle = await this.fleet.findById(vehicleId);
      if (vehicle && canTransitionVehicle(vehicle.status, target)) {
        await this.fleet.transition(vehicleId, target, actorId, `Hợp đồng ${contract.code}`);
      }
    }
    await this.sync(contract, actorId, [vehicleId]);
  }

  private async syncVehicle(vehicleId: string, actorId: string, reason: string) {
    const vehicle = await this.fleet.findById(vehicleId);
    if (!vehicle || !OPERATIONAL_STATUSES.includes(vehicle.status)) return;
    const desired = await this.contracts.vehicleHold(vehicleId);
    if (vehicle.status === desired) return;
    await this.fleet.transition(vehicleId, desired, actorId, reason);
  }
}
