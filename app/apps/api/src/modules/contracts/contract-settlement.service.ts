import { Inject, Injectable } from '@nestjs/common';
import type {
  AuthenticatedUser,
  ContractChargeInput,
  ContractSettleInput,
  RentalContract,
  SettlementFigures,
  SettlementStatement,
} from '@rental/contracts';
import { AuditService } from '../../common/audit/audit.service.js';
import { DomainError } from '../../common/errors/domain.error.js';
import { activeLines, openLines } from './contract-lifecycle.policy.js';
import {
  buildStatement,
  chargeAllowed,
  maxDepositApplied,
  settlementFigures,
} from './contract-settlement.policy.js';
import { requireContract } from './contract-view.js';
import { CONTRACT_REPOSITORY } from './contract.tokens.js';
import type { ChargeDraft, ContractRepository, SettlementDraft } from './contract.types.js';

/** Sprint 6 introduces the payment ledger; until then nothing has been collected. */
export const PAID_VND_PENDING_LEDGER = 0;

function settlementMetadata(figures: SettlementFigures) {
  return {
    depositAppliedVnd: figures.depositAppliedVnd,
    receivableVnd: figures.receivableVnd,
    refundVnd: figures.refundVnd,
    totalDueVnd: figures.totalDueVnd,
  };
}

@Injectable()
export class ContractSettlementService {
  constructor(
    @Inject(CONTRACT_REPOSITORY) private readonly repository: ContractRepository,
    private readonly audit: AuditService,
  ) {}

  async statement(id: string): Promise<SettlementStatement> {
    const contract = await requireContract(this.repository, id);
    return buildStatement(contract, { paidVnd: PAID_VND_PENDING_LEDGER });
  }

  /** US-017: manual surcharges need a reason; discounts are Owner-only (BR-06). */
  async addCharge(id: string, input: ContractChargeInput, actor: AuthenticatedUser) {
    if (input.kind === 'DISCOUNT' && actor.role !== 'OWNER') {
      throw new DomainError('FORBIDDEN', 'Chỉ Chủ cửa hàng được giảm trừ cho khách');
    }
    const contract = await requireContract(this.repository, id);
    if (!chargeAllowed(contract)) {
      throw new DomainError('INVALID_TRANSITION', 'Chỉ ghi phụ phí cho hợp đồng chưa tất toán');
    }
    const draft = this.chargeDraft(contract, input);
    const now = new Date().toISOString();
    const updated = await this.repository.addCharge(contract.id, draft, {
      actorId: actor.id,
      metadata: { amountVnd: draft.amountVnd, kind: draft.kind, vehicleCode: draft.vehicleCode },
      occurredAt: now,
      reason: draft.description,
      type: 'CHARGE_ADDED',
    });
    await this.audit.record({
      action: 'CONTRACT_CHARGE_ADDED',
      actorId: actor.id,
      entityId: updated.id,
      entityType: 'Contract',
      metadata: { amountVnd: draft.amountVnd, description: draft.description, kind: draft.kind },
    });
    return updated;
  }

  /** US-017: settlement freezes the figures and confirms deposit and document release. */
  async settle(id: string, input: ContractSettleInput, actor: AuthenticatedUser) {
    const contract = await requireContract(this.repository, id);
    this.assertSettleable(contract);
    const figures = this.figures(contract, input.depositAppliedVnd);
    this.assertChecklist(contract, figures, input);
    const now = new Date().toISOString();
    const draft: SettlementDraft = {
      ...figures,
      depositRefunded: input.depositRefunded,
      documentReturned: input.documentReturned,
      notes: input.notes,
      settledAt: now,
      settledById: actor.id,
    };
    const updated = await this.repository.settle(contract.id, draft, {
      actorId: actor.id,
      metadata: settlementMetadata(figures),
      occurredAt: now,
      reason: input.notes || null,
      type: 'SETTLED',
    });
    await this.audit.record({
      action: 'CONTRACT_SETTLED',
      actorId: actor.id,
      entityId: updated.id,
      entityType: 'Contract',
      metadata: settlementMetadata(figures),
    });
    return updated;
  }

  private chargeDraft(contract: RentalContract, input: ContractChargeInput): ChargeDraft {
    const line = input.lineId
      ? activeLines(contract.quote.lines).find((item) => item.id === input.lineId)
      : undefined;
    if (input.lineId && !line) {
      throw new DomainError('NOT_FOUND', 'Không tìm thấy dòng xe trên hợp đồng này');
    }
    return {
      amountVnd: input.amountVnd,
      description: input.description,
      kind: input.kind,
      lineId: line?.id ?? null,
      vehicleCode: line?.vehicleCode ?? null,
    };
  }

  private assertSettleable(contract: RentalContract) {
    if (contract.settledAt !== null) {
      throw new DomainError('INVALID_TRANSITION', 'Hợp đồng đã tất toán');
    }
    if (contract.status === 'COMPLETED') return;
    const open = openLines(contract.quote.lines).map((line) => line.vehicleCode);
    throw new DomainError(
      'INVALID_TRANSITION',
      open.length ? `Còn xe chưa trả: ${open.join(', ')}` : 'Chỉ tất toán hợp đồng đã trả đủ xe',
    );
  }

  private figures(contract: RentalContract, depositAppliedVnd: number | undefined) {
    const preview = buildStatement(contract, { paidVnd: PAID_VND_PENDING_LEDGER });
    const cap = maxDepositApplied(preview.depositVnd, preview.outstandingVnd);
    if (depositAppliedVnd !== undefined && depositAppliedVnd > cap) {
      throw new DomainError(
        'INVALID_INPUT',
        `Tiền cọc khấu trừ tối đa ${cap.toLocaleString('vi-VN')} ₫`,
      );
    }
    return settlementFigures({
      chargesVnd: preview.chargesVnd,
      depositAppliedVnd,
      depositVnd: preview.depositVnd,
      discountsVnd: preview.discountsVnd,
      paidVnd: preview.paidVnd,
    });
  }

  private assertChecklist(
    contract: RentalContract,
    figures: SettlementFigures,
    input: ContractSettleInput,
  ) {
    if (contract.handover.retainedDocument && !input.documentReturned) {
      throw new DomainError('INVALID_INPUT', 'Xác nhận đã trả giấy tờ giữ lại cho khách');
    }
    if (figures.refundVnd > 0 && !input.depositRefunded) {
      throw new DomainError('INVALID_INPUT', 'Xác nhận đã hoàn cọc cho khách');
    }
  }
}
