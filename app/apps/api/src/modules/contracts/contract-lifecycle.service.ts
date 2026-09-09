import { Inject, Injectable } from '@nestjs/common';
import type {
  AuthenticatedUser,
  ContractCancelInput,
  ContractStatus,
  OverdueEvaluation,
  RentalContract,
} from '@rental/contracts';
import { AuditService } from '../../common/audit/audit.service.js';
import { DomainError } from '../../common/errors/domain.error.js';
import {
  canTransitionContract,
  isPastScheduledEnd,
  type LifecycleTransition,
} from './contract-lifecycle.policy.js';
import { requireContract } from './contract-view.js';
import { CONTRACT_REPOSITORY } from './contract.tokens.js';
import type { ContractRepository, LifecycleEventInput, LifecyclePatch } from './contract.types.js';
import { VehicleSyncService } from './vehicle-sync.service.js';

export const SYSTEM_ACTOR_ID = 'system';

const TRANSITION_MESSAGE: Readonly<Record<LifecycleTransition, string>> = {
  ACTIVATE: 'Chỉ bàn giao xe cho hợp đồng đang đặt trước',
  CANCEL: 'Chỉ hủy được hợp đồng chưa bàn giao xe',
  COMPLETE: 'Chỉ đóng được hợp đồng đang thuê hoặc quá hạn',
  OVERDUE: 'Chỉ hợp đồng đang thuê mới chuyển sang quá hạn',
};

export function assertTransition(status: ContractStatus, transition: LifecycleTransition) {
  if (!canTransitionContract(status, transition)) {
    throw new DomainError('INVALID_TRANSITION', TRANSITION_MESSAGE[transition]);
  }
}

interface TransitionRequest {
  action: string;
  event: LifecycleEventInput;
  patch: LifecyclePatch;
}

@Injectable()
export class ContractLifecycleService {
  constructor(
    @Inject(CONTRACT_REPOSITORY) private readonly repository: ContractRepository,
    private readonly vehicles: VehicleSyncService,
    private readonly audit: AuditService,
  ) {}

  async activate(id: string, actor: AuthenticatedUser): Promise<RentalContract> {
    const contract = await requireContract(this.repository, id);
    assertTransition(contract.status, 'ACTIVATE');
    const now = new Date().toISOString();
    return this.transition(contract, actor, {
      action: 'CONTRACT_ACTIVATED',
      event: { actorId: actor.id, occurredAt: now, type: 'ACTIVATED' },
      patch: { activatedAt: now, status: 'ACTIVE' },
    });
  }

  async cancel(id: string, input: ContractCancelInput, actor: AuthenticatedUser) {
    const contract = await requireContract(this.repository, id);
    assertTransition(contract.status, 'CANCEL');
    const now = new Date().toISOString();
    return this.transition(contract, actor, {
      action: 'CONTRACT_CANCELLED',
      event: { actorId: actor.id, occurredAt: now, reason: input.reason, type: 'CANCELLED' },
      patch: {
        cancellationReason: input.reason,
        cancelledAt: now,
        cancelledById: actor.id,
        status: 'CANCELLED',
      },
    });
  }

  async complete(id: string, actor: AuthenticatedUser): Promise<RentalContract> {
    const contract = await requireContract(this.repository, id);
    assertTransition(contract.status, 'COMPLETE');
    const now = new Date().toISOString();
    return this.transition(contract, actor, {
      action: 'CONTRACT_COMPLETED',
      event: { actorId: actor.id, occurredAt: now, type: 'COMPLETED' },
      patch: { completedAt: now, status: 'COMPLETED' },
    });
  }

  /** Idempotent scheduled evaluation: only ACTIVE contracts past their scheduled end change. */
  async evaluateOverdue(now = new Date()): Promise<OverdueEvaluation> {
    const open = await this.repository.listOpen();
    const due = open.filter(
      (contract) => contract.status === 'ACTIVE' && isPastScheduledEnd(contract.quote.endAt, now),
    );
    const marked: string[] = [];
    for (const contract of due) {
      const updated = await this.repository.applyLifecycle(
        contract.id,
        { overdueSince: contract.quote.endAt, status: 'OVERDUE' },
        {
          actorId: SYSTEM_ACTOR_ID,
          metadata: { scheduledEndAt: contract.quote.endAt },
          occurredAt: now.toISOString(),
          type: 'OVERDUE',
        },
      );
      await this.record('CONTRACT_OVERDUE', SYSTEM_ACTOR_ID, updated);
      marked.push(updated.code);
    }
    return { evaluatedAt: now.toISOString(), markedContractCodes: marked };
  }

  private async transition(
    contract: RentalContract,
    actor: AuthenticatedUser,
    request: TransitionRequest,
  ) {
    const updated = await this.repository.applyLifecycle(contract.id, request.patch, request.event);
    await this.vehicles.sync(updated, actor.id);
    const reason = request.event.reason;
    await this.record(request.action, actor.id, updated, reason ? { reason } : undefined);
    return updated;
  }

  private record(
    action: string,
    actorId: string,
    contract: RentalContract,
    metadata?: Record<string, string | number>,
  ) {
    return this.audit.record({
      action,
      actorId,
      entityId: contract.id,
      entityType: 'Contract',
      ...(metadata ? { metadata } : {}),
    });
  }
}
