import { Inject, Injectable } from '@nestjs/common';
import type {
  AuthenticatedUser,
  AvailabilityInput,
  ContractCreateInput,
  LateReturnFeeInput,
} from '@rental/contracts';
import { AuditService } from '../../common/audit/audit.service.js';
import { DomainError } from '../../common/errors/domain.error.js';
import { PricingService } from '../pricing/pricing.service.js';
import { calculateLateReturnFee } from '../pricing/pricing.policy.js';
import { nextContractCode } from './contract-code.service.js';
import { openLines } from './contract-lifecycle.policy.js';
import { requireContract } from './contract-view.js';
import { CONTRACT_REPOSITORY } from './contract.tokens.js';
import type { ContractRepository } from './contract.types.js';
import { VehicleSyncService } from './vehicle-sync.service.js';

@Injectable()
export class ContractService {
  constructor(
    @Inject(CONTRACT_REPOSITORY) private readonly repository: ContractRepository,
    private readonly pricing: PricingService,
    private readonly audit: AuditService,
    private readonly vehicles: VehicleSyncService,
  ) {}

  async availability(input: AvailabilityInput) {
    this.assertInterval(input.startAt, input.endAt);
    const conflicts = await this.repository.findConflicts(input);
    return { available: conflicts.length === 0, conflicts };
  }

  async create(input: ContractCreateInput, actor: AuthenticatedUser) {
    this.assertPrivateKeys(input.handover.imageObjectKeys);
    const existing = await this.repository.findByIdempotencyKey(input.idempotencyKey);
    if (existing) return existing;
    const quote = await this.pricing.quote(input, actor);
    const contract = await this.repository.createAtomic({
      actorId: actor.id,
      code: nextContractCode(),
      customerId: input.customerId,
      handover: input.handover,
      idempotencyKey: input.idempotencyKey,
      quote,
    });
    await this.vehicles.sync(contract, actor.id);
    await this.audit.record({
      action: 'CONTRACT_CREATED',
      actorId: actor.id,
      entityId: contract.id,
      entityType: 'Contract',
    });
    return contract;
  }

  get(id: string) {
    return requireContract(this.repository, id);
  }

  async lateReturnFee(id: string, input: LateReturnFeeInput) {
    const contract = await this.get(id);
    const line = openLines(contract.quote.lines).find((item) => item.vehicleId === input.vehicleId);
    if (!line) throw new DomainError('NOT_FOUND', 'Xe không thuộc hợp đồng này');
    try {
      return {
        ...calculateLateReturnFee(line.endAt, input.actualReturnAt, line.lateReturnPolicy),
        vehicleId: input.vehicleId,
      };
    } catch {
      throw new DomainError('INVALID_INPUT', 'Thời điểm trả xe không hợp lệ');
    }
  }

  async imageAccess(id: string) {
    await this.get(id);
    const keys = await this.repository.imageObjectKeys(id);
    return {
      items: keys.map((_, index) => ({
        expiresInSeconds: 300,
        label: `Ảnh bàn giao ${index + 1}`,
        url: `/api/private/contract-images/${id}/${index}?signature=demo`,
      })),
    };
  }

  private assertInterval(startAt: string, endAt: string) {
    if (Date.parse(startAt) >= Date.parse(endAt)) {
      throw new DomainError('INVALID_INPUT', 'Giờ trả xe phải sau giờ nhận xe');
    }
  }

  private assertPrivateKeys(keys: string[]) {
    if (keys.some((key) => !key.startsWith('private/handovers/'))) {
      throw new DomainError('INVALID_INPUT', 'Ảnh bàn giao phải nằm trong kho riêng tư');
    }
  }
}
