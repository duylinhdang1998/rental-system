import { Inject, Injectable } from '@nestjs/common';
import type {
  AuthenticatedUser,
  AvailabilityConflict,
  ContractExtendInput,
  ContractLine,
  RentalContract,
} from '@rental/contracts';
import { AuditService } from '../../common/audit/audit.service.js';
import { DomainError } from '../../common/errors/domain.error.js';
import {
  applyPercentAdjustment,
  billableRentalDays,
  calculateTierPrice,
  explainPrice,
} from '../pricing/pricing.policy.js';
import { PricingService } from '../pricing/pricing.service.js';
import {
  activeLines,
  chainStartAt,
  isOpenContract,
  statusAfterEndChange,
} from './contract-lifecycle.policy.js';
import { requireContract } from './contract-view.js';
import { CONTRACT_REPOSITORY } from './contract.tokens.js';
import type { ContractRepository, ExtensionChange, RepricedLine } from './contract.types.js';

export function conflictMessage(
  conflicts: AvailabilityConflict[],
  lines: readonly Pick<ContractLine, 'vehicleCode' | 'vehicleId'>[],
): string {
  const details = conflicts.map((conflict) => {
    const code = lines.find((line) => line.vehicleId === conflict.vehicleId)?.vehicleCode;
    return `${code ?? conflict.vehicleId} (hợp đồng ${conflict.contractCode})`;
  });
  return `Xe ${details.join(', ')} đã có lịch thuê trùng thời gian`;
}

type ExtensionMetadata = Record<
  'newEndAt' | 'newTotalVnd' | 'previousEndAt' | 'previousTotalVnd',
  number | string
>;

@Injectable()
export class ContractExtensionService {
  constructor(
    @Inject(CONTRACT_REPOSITORY) private readonly repository: ContractRepository,
    private readonly pricing: PricingService,
    private readonly audit: AuditService,
  ) {}

  /** US-014: extension checks the extra range, then reprices the whole period (PD-06 default). */
  async extend(id: string, input: ContractExtendInput, actor: AuthenticatedUser) {
    const contract = await requireContract(this.repository, id);
    const lines = this.extendableLines(contract, input, actor);
    const conflicts = await this.repository.findConflicts({
      endAt: input.newEndAt,
      startAt: contract.quote.endAt,
      vehicleIds: lines.map((line) => line.vehicleId),
    });
    if (conflicts.length) throw new DomainError('CONFLICT', conflictMessage(conflicts, lines));
    const repriced = await Promise.all(
      lines.map((line) => this.reprice(line, contract.quote.lines, input.newEndAt)),
    );
    const change = this.change(contract, input.newEndAt, repriced);
    const metadata = this.metadata(contract, change);
    const updated = await this.repository.extend(contract.id, change, {
      actorId: actor.id,
      metadata,
      occurredAt: new Date().toISOString(),
      reason: input.reason ?? null,
      type: 'EXTENDED',
    });
    await this.audit.record({
      action: 'CONTRACT_EXTENDED',
      actorId: actor.id,
      entityId: updated.id,
      entityType: 'Contract',
      metadata,
    });
    return updated;
  }

  private extendableLines(
    contract: RentalContract,
    input: ContractExtendInput,
    actor: AuthenticatedUser,
  ): ContractLine[] {
    if (!isOpenContract(contract.status)) {
      throw new DomainError('INVALID_TRANSITION', 'Không thể gia hạn hợp đồng đã đóng hoặc đã hủy');
    }
    if (Date.parse(input.newEndAt) <= Date.parse(contract.quote.endAt)) {
      throw new DomainError('INVALID_INPUT', 'Ngày trả mới phải sau ngày trả hiện tại');
    }
    const lines = activeLines(contract.quote.lines);
    if (lines.some((line) => line.overrideReason) && actor.role !== 'OWNER') {
      throw new DomainError('FORBIDDEN', 'Chỉ Chủ cửa hàng được gia hạn hợp đồng có giá sửa tay');
    }
    return lines;
  }

  private async reprice(
    line: ContractLine,
    lines: readonly ContractLine[],
    newEndAt: string,
  ): Promise<RepricedLine> {
    const version = await this.pricing.version(line.pricingVersionId);
    const billableDays = billableRentalDays(chainStartAt(line, lines), newEndAt);
    const calculated = calculateTierPrice(billableDays, version.tiers);
    const explanation = explainPrice(
      billableDays,
      calculated.dailyRateVnd,
      version.version,
      line.adjustmentPercent,
    );
    return {
      baseSubtotalVnd: calculated.subtotalVnd,
      billableDays,
      dailyRateVnd: calculated.dailyRateVnd,
      explanation: `${explanation} · gia hạn`,
      finalSubtotalVnd: applyPercentAdjustment(calculated.subtotalVnd, line.adjustmentPercent),
      id: line.id,
    };
  }

  private change(
    contract: RentalContract,
    newEndAt: string,
    lines: RepricedLine[],
  ): ExtensionChange {
    return {
      endAt: newEndAt,
      lines,
      status: statusAfterEndChange(contract.status, newEndAt, new Date()),
      totalVnd: lines.reduce(
        (sum, line) => sum + line.finalSubtotalVnd,
        contract.quote.deliveryFeeVnd,
      ),
    };
  }

  private metadata(contract: RentalContract, change: ExtensionChange): ExtensionMetadata {
    return {
      newEndAt: change.endAt,
      newTotalVnd: change.totalVnd,
      previousEndAt: contract.quote.endAt,
      previousTotalVnd: contract.quote.totalVnd,
    };
  }
}
