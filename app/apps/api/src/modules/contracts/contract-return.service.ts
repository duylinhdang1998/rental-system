import { Inject, Injectable } from '@nestjs/common';
import {
  MILLISECONDS_PER_HOUR,
  calculateLateReturnFee,
  type AuthenticatedUser,
  type ContractLine,
  type ContractReturnInput,
  type LateReturnFee,
  type RentalContract,
  type ReturnCondition,
  type ReturnQueue,
  type VehicleStatus,
} from '@rental/contracts';
import { AuditService } from '../../common/audit/audit.service.js';
import { DomainError } from '../../common/errors/domain.error.js';
import { FLEET_REPOSITORY } from '../fleet/fleet.tokens.js';
import type { FleetRepository } from '../fleet/fleet.types.js';
import { canTransitionVehicle } from '../fleet/vehicle-transition.policy.js';
import { isRentingContract, openLines } from './contract-lifecycle.policy.js';
import { requireContract } from './contract-view.js';
import { CONTRACT_REPOSITORY } from './contract.tokens.js';
import type {
  ChargeDraft,
  ContractRepository,
  LifecycleEventInput,
  ReturnChange,
} from './contract.types.js';
import { buildReturnQueue } from './return-queue.policy.js';
import { VehicleSyncService } from './vehicle-sync.service.js';

const MINUTES_PER_HOUR = 60;
const FUTURE_TOLERANCE_MINUTES = 5;
const FUTURE_TOLERANCE_MS = (MILLISECONDS_PER_HOUR / MINUTES_PER_HOUR) * FUTURE_TOLERANCE_MINUTES;
const PRIVATE_RETURN_PREFIX = 'private/returns/';
/** GOOD keeps the schedule-driven status; the others park the vehicle outside the rental flow. */
const CONDITION_STATUS: Readonly<Record<ReturnCondition, VehicleStatus | null>> = {
  DAMAGED: 'DAMAGED',
  GOOD: null,
  MAINTENANCE: 'MAINTENANCE',
};

function lateFeeCharge(line: ContractLine, fee: LateReturnFee): ChargeDraft[] {
  if (fee.feeVnd === 0) return [];
  return [
    {
      amountVnd: fee.feeVnd,
      description: `Trả trễ ${fee.lateMinutes} phút · ${fee.billableLateHours} giờ tính phí`,
      kind: 'LATE_RETURN',
      lineId: line.id,
      metadata: {
        billableLateHours: fee.billableLateHours,
        lateMinutes: fee.lateMinutes,
        scheduledEndAt: fee.scheduledEndAt,
      },
      vehicleCode: line.vehicleCode,
    },
  ];
}

function inspectionCharges(line: ContractLine, input: ContractReturnInput): ChargeDraft[] {
  return input.charges.map((charge) => ({
    amountVnd: charge.amountVnd,
    description: charge.description,
    kind: charge.kind,
    lineId: line.id,
    vehicleCode: line.vehicleCode,
  }));
}

function chargeEvent(charge: ChargeDraft, actorId: string, occurredAt: string) {
  return {
    actorId,
    metadata: { amountVnd: charge.amountVnd, kind: charge.kind, vehicleCode: charge.vehicleCode },
    occurredAt,
    reason: charge.description,
    type: 'CHARGE_ADDED' as const,
  };
}

interface ReturnContext {
  actorId: string;
  fee: LateReturnFee;
  line: ContractLine;
  recordedAt: string;
}

interface ReturnDraft {
  actualReturnAt: string;
  contract: RentalContract;
  input: ContractReturnInput;
}

function buildChange(draft: ReturnDraft, context: ReturnContext): ReturnChange {
  const { actualReturnAt, contract, input } = draft;
  const { fee, line } = context;
  return {
    charges: [...lateFeeCharge(line, fee), ...inspectionCharges(line, input)],
    completedAt: openLines(contract.quote.lines).length === 1 ? actualReturnAt : null,
    inspection: {
      actualReturnAt,
      condition: input.condition,
      fuelPercent: input.fuelPercent,
      imageObjectKeys: input.imageObjectKeys,
      lateFeeVnd: fee.feeVnd,
      notes: input.notes,
      returnedById: context.actorId,
    },
    lineId: line.id,
  };
}

function returnEvents(change: ReturnChange, context: ReturnContext): LifecycleEventInput[] {
  const { actorId, fee, line, recordedAt } = context;
  const events: LifecycleEventInput[] = [
    {
      actorId,
      metadata: {
        actualReturnAt: change.inspection.actualReturnAt,
        completed: change.completedAt !== null,
        condition: change.inspection.condition,
        fuelPercent: change.inspection.fuelPercent,
        lateFeeVnd: fee.feeVnd,
        lateMinutes: fee.lateMinutes,
        scheduledEndAt: line.endAt,
        vehicleCode: line.vehicleCode,
      },
      occurredAt: recordedAt,
      reason: change.inspection.notes || null,
      type: 'LINE_RETURNED',
    },
    ...change.charges
      .filter((charge) => charge.kind !== 'LATE_RETURN')
      .map((charge) => chargeEvent(charge, actorId, recordedAt)),
  ];
  if (change.completedAt) {
    events.push({ actorId, occurredAt: recordedAt, type: 'COMPLETED' });
  }
  return events;
}

@Injectable()
export class ContractReturnService {
  constructor(
    @Inject(CONTRACT_REPOSITORY) private readonly repository: ContractRepository,
    @Inject(FLEET_REPOSITORY) private readonly fleet: FleetRepository,
    private readonly vehicles: VehicleSyncService,
    private readonly audit: AuditService,
  ) {}

  /** US-016: each vehicle is received on its own; the last one completes the contract (BR-03). */
  async returnVehicle(
    id: string,
    lineId: string,
    input: ContractReturnInput,
    actor: AuthenticatedUser,
  ): Promise<RentalContract> {
    const contract = await requireContract(this.repository, id);
    const line = this.openLine(contract, lineId);
    this.assertPrivateKeys(input.imageObjectKeys);
    const now = new Date();
    const actualReturnAt = this.returnMoment(line, input.actualReturnAt, now);
    const fee = calculateLateReturnFee(line.endAt, actualReturnAt, line.lateReturnPolicy);
    const context = { actorId: actor.id, fee, line, recordedAt: now.toISOString() };
    const change = buildChange({ actualReturnAt, contract, input }, context);
    const updated = await this.repository.returnLine(
      contract.id,
      change,
      returnEvents(change, context),
    );
    await this.settleVehicleStatus(updated, line, input.condition, actor.id);
    await this.recordAudit(updated, change, fee, actor.id);
    return updated;
  }

  /** Read-only queue of vehicles still out, evaluated in business time. */
  async queue(now = new Date()): Promise<ReturnQueue> {
    return buildReturnQueue(await this.repository.listOpen(), now);
  }

  private openLine(contract: RentalContract, lineId: string): ContractLine {
    if (!isRentingContract(contract.status)) {
      throw new DomainError(
        'INVALID_TRANSITION',
        'Chỉ nhận xe khi hợp đồng đang thuê hoặc quá hạn',
      );
    }
    const line = openLines(contract.quote.lines).find((item) => item.id === lineId);
    if (!line) throw new DomainError('NOT_FOUND', 'Không tìm thấy xe chưa trả trên hợp đồng này');
    return line;
  }

  private returnMoment(line: ContractLine, requested: string | undefined, now: Date): string {
    const actual = requested ? Date.parse(requested) : now.getTime();
    if (actual < Date.parse(line.startAt)) {
      throw new DomainError('INVALID_INPUT', 'Giờ trả xe không thể trước giờ nhận xe');
    }
    if (actual > now.getTime() + FUTURE_TOLERANCE_MS) {
      throw new DomainError('INVALID_INPUT', 'Giờ trả xe không thể ở tương lai');
    }
    return new Date(actual).toISOString();
  }

  private assertPrivateKeys(keys: string[]) {
    if (keys.some((key) => !key.startsWith(PRIVATE_RETURN_PREFIX))) {
      throw new DomainError('INVALID_INPUT', 'Ảnh nhận xe phải nằm trong kho riêng tư');
    }
  }

  /** BR-02: a damaged or worn vehicle leaves the rental flow before the schedule sync runs. */
  private async settleVehicleStatus(
    contract: RentalContract,
    line: ContractLine,
    condition: ReturnCondition,
    actorId: string,
  ) {
    const target = CONDITION_STATUS[condition];
    if (target) {
      const vehicle = await this.fleet.findById(line.vehicleId);
      if (vehicle && canTransitionVehicle(vehicle.status, target)) {
        await this.fleet.transition(line.vehicleId, target, actorId, `Hợp đồng ${contract.code}`);
      }
    }
    await this.vehicles.sync(contract, actorId, [line.vehicleId]);
  }

  private async recordAudit(
    contract: RentalContract,
    change: ReturnChange,
    fee: LateReturnFee,
    actorId: string,
  ) {
    const line = contract.quote.lines.find((item) => item.id === change.lineId);
    await this.audit.record({
      action: 'CONTRACT_VEHICLE_RETURNED',
      actorId,
      entityId: contract.id,
      entityType: 'Contract',
      metadata: {
        condition: change.inspection.condition,
        lateFeeVnd: fee.feeVnd,
        vehicleCode: line?.vehicleCode ?? change.lineId,
      },
    });
    if (!change.completedAt) return;
    await this.audit.record({
      action: 'CONTRACT_COMPLETED',
      actorId,
      entityId: contract.id,
      entityType: 'Contract',
    });
  }
}
