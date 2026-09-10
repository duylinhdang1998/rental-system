import { Inject, Injectable } from '@nestjs/common';
import type {
  AuthenticatedUser,
  ContractLedger,
  ContractPaymentInput,
  RentalContract,
} from '@rental/contracts';
import { AuditService } from '../../common/audit/audit.service.js';
import { DomainError } from '../../common/errors/domain.error.js';
import { EmployeeDirectory } from '../auth/employee-directory.js';
import { contractBalance, contractPaymentCap, paymentAllowed } from './contract-payment.policy.js';
import { requireContract } from './contract-view.js';
import { CONTRACT_REPOSITORY } from './contract.tokens.js';
import type { ContractRepository, PaymentDraft } from './contract.types.js';

const EVENT_TYPES = { PAYMENT: 'PAYMENT_RECORDED', REFUND: 'REFUND_RECORDED' } as const;

function vnd(value: number): string {
  return `${value.toLocaleString('vi-VN')} ₫`;
}

@Injectable()
export class ContractPaymentService {
  constructor(
    @Inject(CONTRACT_REPOSITORY) private readonly repository: ContractRepository,
    private readonly employees: EmployeeDirectory,
    private readonly audit: AuditService,
  ) {}

  /** US-018: several transactions per contract, cash or bank transfer, capped and idempotent. */
  async record(id: string, input: ContractPaymentInput, actor: AuthenticatedUser) {
    const replay = await this.repository.findByPaymentKey(input.idempotencyKey);
    if (replay) return this.assertSameReplay(replay, id, input);
    const contract = await requireContract(this.repository, id);
    const draft = this.draft(contract, input, actor);
    const updated = await this.repository.addPayment(contract.id, draft, {
      actorId: actor.id,
      metadata: { amountVnd: draft.amountVnd, kind: draft.kind, method: draft.method },
      occurredAt: draft.receivedAt,
      reason: draft.notes || null,
      type: EVENT_TYPES[draft.kind],
    });
    await this.audit.record({
      action: draft.kind === 'REFUND' ? 'CONTRACT_REFUND_RECORDED' : 'CONTRACT_PAYMENT_RECORDED',
      actorId: actor.id,
      entityId: updated.id,
      entityType: 'Contract',
      metadata: { amountVnd: draft.amountVnd, method: draft.method, reference: draft.reference },
    });
    return updated;
  }

  async ledger(id: string): Promise<ContractLedger> {
    const contract = await requireContract(this.repository, id);
    const names = await this.employees.names(contract.payments.map((item) => item.receivedById));
    return {
      balance: contractBalance(contract),
      code: contract.code,
      contractId: contract.id,
      entries: contract.payments.map((payment) => ({
        ...payment,
        receivedByName: names.get(payment.receivedById) ?? payment.receivedById,
      })),
      paymentAllowed: paymentAllowed(contract),
      settledAt: contract.settledAt,
    };
  }

  private draft(
    contract: RentalContract,
    input: ContractPaymentInput,
    actor: AuthenticatedUser,
  ): PaymentDraft {
    if (!paymentAllowed(contract)) {
      throw new DomainError('INVALID_TRANSITION', 'Hợp đồng đã hủy không ghi nhận thanh toán');
    }
    const cap = contractPaymentCap(contract, input.kind);
    if (input.amountVnd > cap) {
      const label = input.kind === 'REFUND' ? 'Hoàn tối đa' : 'Thu tối đa';
      throw new DomainError('INVALID_INPUT', `${label} ${vnd(cap)}`);
    }
    return {
      amountVnd: input.amountVnd,
      idempotencyKey: input.idempotencyKey,
      kind: input.kind,
      method: input.method,
      notes: input.notes,
      receivedAt: input.receivedAt ?? new Date().toISOString(),
      receivedById: actor.id,
      reference: input.reference,
    };
  }

  /** Same key, same contract and same amount → the stored snapshot; anything else is a conflict. */
  private assertSameReplay(stored: RentalContract, id: string, input: ContractPaymentInput) {
    const payment = stored.payments.find((item) => item.id === input.idempotencyKey);
    const same =
      stored.id === id &&
      payment !== undefined &&
      payment.amountVnd === input.amountVnd &&
      payment.kind === input.kind;
    if (!same) {
      throw new DomainError('CONFLICT', 'Khóa giao dịch đã được dùng cho một khoản thu khác');
    }
    return stored;
  }
}
