import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type {
  AvailabilityInput,
  ContractListQuery,
  ContractSummary,
  RentalContract,
} from '@rental/contracts';
import { DomainError } from '../../common/errors/domain.error.js';
import { PrismaService } from '../../database/prisma.service.js';
import {
  OPEN_CONTRACT_STATUSES,
  holdFromStatuses,
  type VehicleHold,
} from './contract-lifecycle.policy.js';
import { contractSummary } from './contract-view.js';
import {
  CONTRACT_INCLUDE,
  eventData,
  lineData,
  mapRecord,
  type ContractRecord,
} from './prisma-contract.mapper.js';
import { contractCreateData, contractListWhere } from './prisma-contract.queries.js';
import { writeDepositRefund, writePayment } from './prisma-payment.writes.js';
import { writeCharge, writeReturn, writeSettlement } from './prisma-return.writes.js';
import type {
  ChargeDraft,
  ContractDraft,
  ContractRepository,
  ExtensionChange,
  LifecycleEventInput,
  LifecyclePatch,
  PaymentDraft,
  ReturnChange,
  SettlementDraft,
  SwapChange,
} from './contract.types.js';

const SERIALIZABLE = { isolationLevel: Prisma.TransactionIsolationLevel.Serializable } as const;
const RELEASING_STATUSES = ['CANCELLED', 'COMPLETED'] as const;
const UNIQUE_VIOLATION = 'P2002';

function isOverlapError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError || String(error).includes('no_overlap')
  );
}

/** Duck-typed on purpose: monorepos may load two Prisma client copies, breaking instanceof. */
function isUniqueViolation(error: unknown): boolean {
  return error instanceof Error && (error as { code?: string }).code === UNIQUE_VIOLATION;
}

function toDate(value?: string): Date | undefined {
  return value ? new Date(value) : undefined;
}

@Injectable()
export class PrismaContractRepository implements ContractRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createAtomic(draft: ContractDraft): Promise<RentalContract> {
    return this.guarded(async () => {
      const record = await this.prisma.$transaction(
        (transaction) => this.createInTransaction(transaction, draft),
        SERIALIZABLE,
      );
      return mapRecord(record);
    });
  }

  async applyLifecycle(id: string, patch: LifecyclePatch, event: LifecycleEventInput) {
    const releasing = RELEASING_STATUSES.some((status) => status === patch.status);
    const record = await this.prisma.$transaction(async (transaction) => {
      if (releasing) {
        await transaction.contractVehicleLine.updateMany({
          data: { blocksAvailability: false },
          where: { contractId: id },
        });
      }
      return transaction.contract.update({
        data: {
          activatedAt: toDate(patch.activatedAt),
          cancellationReason: patch.cancellationReason,
          cancelledAt: toDate(patch.cancelledAt),
          cancelledById: patch.cancelledById,
          completedAt: toDate(patch.completedAt),
          events: { create: eventData(event) },
          overdueSince: toDate(patch.overdueSince),
          status: patch.status,
        },
        include: CONTRACT_INCLUDE,
        where: { id },
      });
    });
    return mapRecord(record);
  }

  async extend(id: string, change: ExtensionChange, event: LifecycleEventInput) {
    return this.guarded(async () => {
      const record = await this.prisma.$transaction(async (transaction) => {
        for (const line of change.lines) {
          await transaction.contractVehicleLine.update({
            data: { ...line, endAt: new Date(change.endAt), id: undefined, overrideReason: null },
            where: { id: line.id },
          });
        }
        return transaction.contract.update({
          data: {
            events: { create: eventData(event) },
            status: change.status,
            totalVnd: change.totalVnd,
          },
          include: CONTRACT_INCLUDE,
          where: { id },
        });
      }, SERIALIZABLE);
      return mapRecord(record);
    });
  }

  async swap(id: string, change: SwapChange, event: LifecycleEventInput) {
    return this.guarded(async () => {
      const record = await this.prisma.$transaction(async (transaction) => {
        await transaction.contractVehicleLine.update({
          data: { endAt: new Date(change.swapAt) },
          where: { id: change.closedLineId },
        });
        await transaction.contractVehicleLine.create({
          data: {
            ...lineData(change.replacement, change.replacement),
            contractId: id,
            id: change.replacement.id,
            replacesLineId: change.closedLineId,
          },
        });
        return transaction.contract.update({
          data: { events: { create: eventData(event) } },
          include: CONTRACT_INCLUDE,
          where: { id },
        });
      }, SERIALIZABLE);
      return mapRecord(record);
    });
  }

  async returnLine(id: string, change: ReturnChange, events: LifecycleEventInput[]) {
    const record = await this.prisma.$transaction(
      (transaction) => writeReturn(transaction, id, change, events),
      SERIALIZABLE,
    );
    return mapRecord(record);
  }

  async addCharge(id: string, draft: ChargeDraft, event: LifecycleEventInput) {
    const record = await this.prisma.$transaction((transaction) =>
      writeCharge(transaction, id, draft, event),
    );
    return mapRecord(record);
  }

  addPayment(id: string, draft: PaymentDraft, event: LifecycleEventInput) {
    return this.ledgerWrite(draft.idempotencyKey, (transaction) =>
      writePayment(transaction, id, draft, event),
    );
  }

  refundDeposit(id: string, draft: PaymentDraft, event: LifecycleEventInput) {
    return this.ledgerWrite(draft.idempotencyKey, (transaction) =>
      writeDepositRefund(transaction, id, draft, event),
    );
  }

  async returnImageObjectKeys(id: string, lineId: string): Promise<string[]> {
    const line = await this.prisma.contractVehicleLine.findFirst({
      select: { returnImageObjectKeys: true },
      where: { contractId: id, id: lineId },
    });
    if (!line) throw new DomainError('NOT_FOUND', 'Không tìm thấy dòng xe trên hợp đồng này');
    return line.returnImageObjectKeys;
  }

  async settle(id: string, draft: SettlementDraft, event: LifecycleEventInput) {
    const record = await this.prisma.$transaction(
      (transaction) => writeSettlement(transaction, id, draft, event),
      SERIALIZABLE,
    );
    return mapRecord(record);
  }

  async findById(id: string): Promise<RentalContract | null> {
    const item = await this.prisma.contract.findUnique({
      include: CONTRACT_INCLUDE,
      where: { id },
    });
    return item ? mapRecord(item) : null;
  }

  async findByIdempotencyKey(key: string): Promise<RentalContract | null> {
    const item = await this.prisma.contract.findUnique({
      include: CONTRACT_INCLUDE,
      where: { idempotencyKey: key },
    });
    return item ? mapRecord(item) : null;
  }

  async findByPaymentKey(key: string): Promise<RentalContract | null> {
    const item = await this.prisma.contract.findFirst({
      include: CONTRACT_INCLUDE,
      where: { payments: { some: { idempotencyKey: key } } },
    });
    return item ? mapRecord(item) : null;
  }

  async findConflicts(input: AvailabilityInput) {
    const lines = await this.prisma.contractVehicleLine.findMany({
      include: { contract: true },
      where: {
        blocksAvailability: true,
        contract: { status: { in: [...OPEN_CONTRACT_STATUSES] } },
        endAt: { gt: new Date(input.startAt) },
        startAt: { lt: new Date(input.endAt) },
        vehicleId: { in: input.vehicleIds },
      },
    });
    return lines.map((line) => ({
      contractCode: line.contract.code,
      endAt: line.endAt.toISOString(),
      startAt: line.startAt.toISOString(),
      vehicleId: line.vehicleId,
    }));
  }

  async imageObjectKeys(id: string): Promise<string[]> {
    const item = await this.prisma.contractHandover.findUnique({ where: { contractId: id } });
    return item?.imageObjectKeys ?? [];
  }

  async list(query: ContractListQuery): Promise<ContractSummary[]> {
    const items = await this.prisma.contract.findMany({
      include: CONTRACT_INCLUDE,
      orderBy: { createdAt: 'desc' },
      where: contractListWhere(query),
    });
    return items.map((item) => contractSummary(mapRecord(item)));
  }

  async listFinancial(): Promise<RentalContract[]> {
    const items = await this.prisma.contract.findMany({
      include: CONTRACT_INCLUDE,
      orderBy: { createdAt: 'asc' },
      where: { status: { not: 'CANCELLED' } },
    });
    return items.map(mapRecord);
  }

  async listOpen(): Promise<RentalContract[]> {
    const items = await this.prisma.contract.findMany({
      include: CONTRACT_INCLUDE,
      orderBy: { createdAt: 'asc' },
      where: { status: { in: [...OPEN_CONTRACT_STATUSES] } },
    });
    return items.map(mapRecord);
  }

  async vehicleHold(vehicleId: string): Promise<VehicleHold> {
    const lines = await this.prisma.contractVehicleLine.findMany({
      select: { contract: { select: { status: true } } },
      where: {
        blocksAvailability: true,
        contract: { status: { in: [...OPEN_CONTRACT_STATUSES] } },
        replacedBy: null,
        vehicleId,
      },
    });
    return holdFromStatuses(lines.map((line) => line.contract.status));
  }

  /** Serializable ledger write; a concurrent replay of the same key returns the stored row. */
  private async ledgerWrite(
    key: string,
    work: (transaction: Prisma.TransactionClient) => Promise<ContractRecord>,
  ): Promise<RentalContract> {
    try {
      return mapRecord(await this.prisma.$transaction(work, SERIALIZABLE));
    } catch (error) {
      if (isUniqueViolation(error)) {
        const stored = await this.findByPaymentKey(key);
        if (stored) return stored;
      }
      throw error;
    }
  }

  private async guarded<T>(work: () => Promise<T>): Promise<T> {
    try {
      return await work();
    } catch (error) {
      if (isOverlapError(error)) {
        throw new DomainError('CONFLICT', 'Một xe vừa có hợp đồng khác trùng thời gian');
      }
      throw error;
    }
  }

  private async createInTransaction(transaction: Prisma.TransactionClient, draft: ContractDraft) {
    const existing = await transaction.contract.findUnique({
      include: CONTRACT_INCLUDE,
      where: { idempotencyKey: draft.idempotencyKey },
    });
    if (existing) return existing;
    return transaction.contract.create({
      data: contractCreateData(draft),
      include: CONTRACT_INCLUDE,
    });
  }
}
