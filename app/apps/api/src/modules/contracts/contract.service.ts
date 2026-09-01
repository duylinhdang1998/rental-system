import { Inject, Injectable } from '@nestjs/common';
import type { AuthenticatedUser, AvailabilityInput, ContractCreateInput } from '@rental/contracts';
import { AuditService } from '../../common/audit/audit.service.js';
import { DomainError } from '../../common/errors/domain.error.js';
import { PricingService } from '../pricing/pricing.service.js';
import { nextContractCode } from './contract-code.service.js';
import { ContractPdfService } from './contract-pdf.service.js';
import { CONTRACT_REPOSITORY } from './contract.tokens.js';
import type { ContractRepository } from './contract.types.js';

@Injectable()
export class ContractService {
  constructor(
    @Inject(CONTRACT_REPOSITORY) private readonly repository: ContractRepository,
    private readonly pricing: PricingService,
    private readonly pdf: ContractPdfService,
    private readonly audit: AuditService,
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
    await this.audit.record({
      action: 'CONTRACT_CREATED',
      actorId: actor.id,
      entityId: contract.id,
      entityType: 'Contract',
    });
    return contract;
  }

  async get(id: string) {
    const contract = await this.repository.findById(id);
    if (!contract) throw new DomainError('NOT_FOUND', 'Không tìm thấy hợp đồng');
    return contract;
  }

  async generatePdf(id: string) {
    return this.pdf.generate(await this.get(id));
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
