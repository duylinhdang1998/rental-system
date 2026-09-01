import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AvailabilityInput, QuoteLine, RentalContract } from '@rental/contracts';
import { DomainError } from '../../common/errors/domain.error.js';
import { PrismaService } from '../../database/prisma.service.js';
import type { ContractDraft, ContractRepository } from './contract.types.js';

const INCLUDE = {
  handover: true,
  lines: { include: { pricingVersion: true, vehicle: true } },
} as const;
type ContractRecord = Prisma.ContractGetPayload<{ include: typeof INCLUDE }>;

function mapLine(line: ContractRecord['lines'][number]): QuoteLine {
  return {
    adjustmentPercent: line.adjustmentPercent,
    baseSubtotalVnd: line.baseSubtotalVnd,
    billableDays: line.billableDays,
    dailyRateVnd: line.dailyRateVnd,
    explanation: line.explanation,
    finalSubtotalVnd: line.finalSubtotalVnd,
    lateReturnPolicy: {
      graceMinutes: line.lateReturnGraceMinutes,
      hourlyRateVnd: line.lateReturnHourlyRateVnd,
    },
    ...(line.overrideReason ? { overrideReason: line.overrideReason } : {}),
    pricingVersionId: line.pricingVersionId,
    pricingVersionNumber: line.pricingVersion.version,
    vehicleCode: line.vehicle.code,
    vehicleId: line.vehicleId,
  };
}

function mapHandover(item: ContractRecord['handover']): RentalContract['handover'] {
  if (!item) {
    return {
      deliveryPlace: '',
      depositVnd: 0,
      fuelPercent: 0,
      imageCount: 0,
      notes: '',
      retainedDocument: '',
    };
  }
  return {
    deliveryPlace: item.deliveryPlace,
    depositVnd: item.depositVnd,
    fuelPercent: item.fuelPercent,
    imageCount: item.imageObjectKeys.length,
    notes: item.notes,
    retainedDocument: item.retainedDocument,
  };
}

function mapRecord(item: ContractRecord): RentalContract {
  const first = item.lines[0];
  const fallback = item.createdAt.toISOString();
  return {
    code: item.code,
    createdAt: fallback,
    customerId: item.customerId,
    handover: mapHandover(item.handover),
    id: item.id,
    quote: {
      deliveryFeeVnd: item.deliveryFeeVnd,
      customerName: item.customerNameSnapshot,
      endAt: first?.endAt.toISOString() ?? fallback,
      lines: item.lines.map(mapLine),
      startAt: first?.startAt.toISOString() ?? fallback,
      totalVnd: item.totalVnd,
    },
    status: 'CONFIRMED',
  };
}

@Injectable()
export class PrismaContractRepository implements ContractRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createAtomic(draft: ContractDraft): Promise<RentalContract> {
    try {
      const record = await this.prisma.$transaction(
        (transaction) => this.createInTransaction(transaction, draft),
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
      return mapRecord(record);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError ||
        String(error).includes('no_overlap')
      ) {
        throw new DomainError('CONFLICT', 'Một xe vừa có hợp đồng khác trùng thời gian');
      }
      throw error;
    }
  }

  async findById(id: string): Promise<RentalContract | null> {
    const item = await this.prisma.contract.findUnique({ include: INCLUDE, where: { id } });
    return item ? mapRecord(item) : null;
  }

  async findByIdempotencyKey(key: string): Promise<RentalContract | null> {
    const item = await this.prisma.contract.findUnique({
      include: INCLUDE,
      where: { idempotencyKey: key },
    });
    return item ? mapRecord(item) : null;
  }

  async findConflicts(input: AvailabilityInput) {
    const lines = await this.prisma.contractVehicleLine.findMany({
      include: { contract: true },
      where: {
        endAt: { gt: new Date(input.startAt) },
        startAt: { lt: new Date(input.endAt) },
        vehicleId: { in: input.vehicleIds },
        contract: { status: { not: 'CANCELLED' } },
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

  private async createInTransaction(transaction: Prisma.TransactionClient, draft: ContractDraft) {
    const existing = await transaction.contract.findUnique({
      include: INCLUDE,
      where: { idempotencyKey: draft.idempotencyKey },
    });
    if (existing) return existing;
    return transaction.contract.create({
      data: {
        code: draft.code,
        createdById: draft.actorId,
        customerId: draft.customerId,
        customerNameSnapshot: draft.quote.customerName,
        deliveryFeeVnd: draft.quote.deliveryFeeVnd,
        handover: { create: draft.handover },
        idempotencyKey: draft.idempotencyKey,
        lines: { create: draft.quote.lines.map((line) => this.lineData(line, draft)) },
        totalVnd: draft.quote.totalVnd,
      },
      include: INCLUDE,
    });
  }

  private lineData(line: QuoteLine, draft: ContractDraft) {
    return {
      adjustmentPercent: line.adjustmentPercent,
      baseSubtotalVnd: line.baseSubtotalVnd,
      billableDays: line.billableDays,
      dailyRateVnd: line.dailyRateVnd,
      endAt: new Date(draft.quote.endAt),
      explanation: line.explanation,
      finalSubtotalVnd: line.finalSubtotalVnd,
      lateReturnGraceMinutes: line.lateReturnPolicy.graceMinutes,
      lateReturnHourlyRateVnd: line.lateReturnPolicy.hourlyRateVnd,
      overrideReason: line.overrideReason,
      pricingVersionId: line.pricingVersionId,
      startAt: new Date(draft.quote.startAt),
      vehicleId: line.vehicleId,
    };
  }
}
