import { Inject, Injectable } from '@nestjs/common';
import type {
  AuthenticatedUser,
  ContractLedger,
  ContractPaymentInput,
  DepositRefundInput,
  PaymentKind,
  RentalContract,
} from '@rental/contracts';
import { AuditService } from '../../common/audit/audit.service.js';
import { DomainError } from '../../common/errors/domain.error.js';
import { EmployeeDirectory } from '../auth/employee-directory.js';
import {
  contractBalance,
  contractPaymentCap,
  depositRefundDue,
  paymentAllowed,
} from './contract-payment.policy.js';
import { requireContract } from './contract-view.js';
import { CONTRACT_REPOSITORY } from './contract.tokens.js';
import type { ContractRepository, PaymentDraft } from './contract.types.js';

const EVENT_TYPES = { PAYMENT: 'PAYMENT_RECORDED', REFUND: 'REFUND_RECORDED' } as const;

interface ReplayExpectation {
  amountVnd?: number;
  kind: PaymentKind;
}

/** The amount is the frozen settlement refund; the caller never chooses it. */
function depositRefundDraft(
  contract: RentalContract,
  input: DepositRefundInput,
  actorId: string,
  now: string,
): PaymentDraft {
  return {
    amountVnd: depositRefundDue(contract),
    idempotencyKey: input.idempotencyKey,
    kind: 'DEPOSIT_REFUND',
    method: input.method,
    notes: input.notes,
    receivedAt: now,
    receivedById: actorId,
    reference: input.reference,
  };
}

function vnd(value: number): string {
  return `${value.toLocaleString('vi-VN')} ₫`;
}

/** Same key, same contract, same kind (and amount) → the stored snapshot; anything else conflicts. */
function assertSameReplay(
  stored: RentalContract,
  id: string,
  key: string,
  expected: ReplayExpectation,
): RentalContract {
  const payment = stored.payments.find((item) => item.id === key);
  const same =
    stored.id === id &&
    payment !== undefined &&
    payment.kind === expected.kind &&
    (expected.amountVnd === undefined || payment.amountVnd === expected.amountVnd);
  if (!same) {
    throw new DomainError('CONFLICT', 'Khóa giao dịch đã được dùng cho một khoản thu khác');
  }
  return stored;
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
    if (replay) return assertSameReplay(replay, id, input.idempotencyKey, input);
    const contract = await requireContract(this.repository, id);
    const draft = this.draft(contract, input, actor);
    const updated = await this.repository.addPayment(contract.id, draft, {
      actorId: actor.id,
      metadata: { amountVnd: draft.amountVnd, kind: draft.kind, method: draft.method },
      occurredAt: draft.receivedAt,
      reason: draft.notes || null,
      type: EVENT_TYPES[input.kind],
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

  /** US-028: the frozen settlement refund leaves through the ledger exactly once (PD-17). */
  async refundDeposit(id: string, input: DepositRefundInput, actor: AuthenticatedUser) {
    const replay = await this.repository.findByPaymentKey(input.idempotencyKey);
    if (replay)
      return assertSameReplay(replay, id, input.idempotencyKey, { kind: 'DEPOSIT_REFUND' });
    const contract = await requireContract(this.repository, id);
    const now = new Date().toISOString();
    const draft = depositRefundDraft(contract, input, actor.id, now);
    const updated = await this.repository.refundDeposit(contract.id, draft, {
      actorId: actor.id,
      metadata: { amountVnd: draft.amountVnd, method: draft.method },
      occurredAt: now,
      reason: draft.notes || null,
      type: 'DEPOSIT_REFUNDED',
    });
    await this.audit.record({
      action: 'CONTRACT_DEPOSIT_REFUNDED',
      actorId: actor.id,
      entityId: updated.id,
      entityType: 'Contract',
      metadata: { amountVnd: draft.amountVnd, method: draft.method },
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
}
