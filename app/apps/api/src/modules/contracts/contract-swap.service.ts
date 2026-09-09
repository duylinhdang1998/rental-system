import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import {
  MILLISECONDS_PER_HOUR,
  type AuthenticatedUser,
  type ContractLine,
  type ContractSwapInput,
  type RentalContract,
  type Vehicle,
  type VehicleStatus,
} from '@rental/contracts';
import { AuditService } from '../../common/audit/audit.service.js';
import { DomainError } from '../../common/errors/domain.error.js';
import { FLEET_REPOSITORY } from '../fleet/fleet.tokens.js';
import type { FleetRepository } from '../fleet/fleet.types.js';
import { conflictMessage } from './contract-extension.service.js';
import { activeLines, isRentingContract } from './contract-lifecycle.policy.js';
import { requireContract } from './contract-view.js';
import { CONTRACT_REPOSITORY } from './contract.tokens.js';
import type { ContractRepository, SwapChange } from './contract.types.js';
import { VehicleSyncService } from './vehicle-sync.service.js';

const MINUTES_PER_HOUR = 60;
const MINUTE_MS = MILLISECONDS_PER_HOUR / MINUTES_PER_HOUR;
/** Replacement vehicles may be free or merely reserved for a later period. */
const SWAPPABLE_VEHICLE_STATUSES: readonly VehicleStatus[] = ['AVAILABLE', 'RESERVED'];

/** A swap closes the old line at "now" but never before the line started (strict interval). */
function swapMoment(now: Date, line: ContractLine): string {
  const earliest = Date.parse(line.startAt) + MINUTE_MS;
  return new Date(Math.max(now.getTime(), earliest)).toISOString();
}

function replacementLine(
  line: ContractLine,
  replacement: Vehicle,
  swapAt: string,
): SwapChange['replacement'] {
  const { replacedByLineId, ...inherited } = line;
  void replacedByLineId;
  return {
    ...inherited,
    explanation: `${line.explanation} · thay cho ${line.vehicleCode}`,
    id: randomUUID(),
    replacesLineId: line.id,
    startAt: swapAt,
    vehicleCode: replacement.code,
    vehicleId: replacement.id,
  };
}

@Injectable()
export class ContractSwapService {
  constructor(
    @Inject(CONTRACT_REPOSITORY) private readonly repository: ContractRepository,
    @Inject(FLEET_REPOSITORY) private readonly fleet: FleetRepository,
    private readonly vehicles: VehicleSyncService,
    private readonly audit: AuditService,
  ) {}

  /** US-015: swap ends the current line and links a replacement of the same vehicle type. */
  async swap(id: string, input: ContractSwapInput, actor: AuthenticatedUser) {
    const contract = await requireContract(this.repository, id);
    const line = this.swappableLine(contract, input.lineId);
    const replacement = await this.replacementVehicle(line, input.replacementVehicleId);
    const swapAt = swapMoment(new Date(), line);
    await this.assertAvailable(line, replacement, swapAt);
    const updated = await this.repository.swap(
      id,
      { closedLineId: line.id, replacement: replacementLine(line, replacement, swapAt), swapAt },
      {
        actorId: actor.id,
        metadata: { fromVehicleCode: line.vehicleCode, swapAt, toVehicleCode: replacement.code },
        occurredAt: swapAt,
        reason: input.reason,
        type: 'SWAPPED',
      },
    );
    await this.vehicles.sync(updated, actor.id, [line.vehicleId, replacement.id]);
    await this.audit.record({
      action: 'CONTRACT_VEHICLE_SWAPPED',
      actorId: actor.id,
      entityId: updated.id,
      entityType: 'Contract',
      metadata: { from: line.vehicleCode, reason: input.reason, to: replacement.code },
    });
    return updated;
  }

  private swappableLine(contract: RentalContract, lineId: string): ContractLine {
    if (!isRentingContract(contract.status)) {
      throw new DomainError('INVALID_TRANSITION', 'Chỉ đổi xe khi hợp đồng đang thuê');
    }
    const line = activeLines(contract.quote.lines).find((item) => item.id === lineId);
    if (!line) throw new DomainError('NOT_FOUND', 'Không tìm thấy dòng xe cần đổi');
    return line;
  }

  private async replacementVehicle(line: ContractLine, vehicleId: string): Promise<Vehicle> {
    if (vehicleId === line.vehicleId) {
      throw new DomainError('INVALID_INPUT', 'Xe thay thế phải khác xe hiện tại');
    }
    const [current, replacement] = await Promise.all([
      this.fleet.findById(line.vehicleId),
      this.fleet.findById(vehicleId),
    ]);
    if (!replacement) throw new DomainError('NOT_FOUND', 'Không tìm thấy xe thay thế');
    if (current && current.typeCode !== replacement.typeCode) {
      throw new DomainError('INVALID_INPUT', 'Xe thay thế phải cùng loại xe');
    }
    if (!SWAPPABLE_VEHICLE_STATUSES.includes(replacement.status)) {
      throw new DomainError('CONFLICT', `Xe ${replacement.code} hiện không sẵn sàng để thay thế`);
    }
    return replacement;
  }

  private async assertAvailable(line: ContractLine, replacement: Vehicle, swapAt: string) {
    const conflicts = await this.repository.findConflicts({
      endAt: line.endAt,
      startAt: swapAt,
      vehicleIds: [replacement.id],
    });
    if (!conflicts.length) return;
    throw new DomainError(
      'CONFLICT',
      conflictMessage(conflicts, [{ vehicleCode: replacement.code, vehicleId: replacement.id }]),
    );
  }
}
