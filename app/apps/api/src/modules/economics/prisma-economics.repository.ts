import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { ISO_DATE_LENGTH, type VehicleAcquisition } from '@rental/contracts';
import { DomainError } from '../../common/errors/domain.error.js';
import { PrismaService } from '../../database/prisma.service.js';
import type {
  AcquisitionDraft,
  EconomicsRepository,
  ExpenseDraft,
  ExpenseFilter,
  ExpenseRecord,
} from './economics.types.js';

const UNIQUE_VIOLATION = 'P2002';

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === UNIQUE_VIOLATION
  );
}

export const EXPENSE_INCLUDE = {
  reversal: { select: { id: true } },
  vehicle: { select: { code: true } },
} satisfies Prisma.ExpenseInclude;

type ExpenseRow = Prisma.ExpenseGetPayload<{ include: typeof EXPENSE_INCLUDE }>;
type AcquisitionRow = Prisma.VehicleAcquisitionGetPayload<Record<string, never>>;

function dayKey(value: Date): string {
  return value.toISOString().slice(0, ISO_DATE_LENGTH);
}

function dayValue(day: string): Date {
  return new Date(`${day}T00:00:00.000Z`);
}

export function mapExpense(row: ExpenseRow): ExpenseRecord {
  return {
    amountVnd: row.amountVnd,
    category: row.category,
    createdAt: row.createdAt.toISOString(),
    description: row.description,
    id: row.id,
    method: row.method,
    notes: row.notes,
    paidOn: dayKey(row.paidOn),
    recordedById: row.recordedById,
    reference: row.reference,
    reversalOfId: row.reversalOfId,
    reversedByExpenseId: row.reversal?.id ?? null,
    vehicleCode: row.vehicle?.code ?? null,
    vehicleId: row.vehicleId,
  };
}

export function mapAcquisition(row: AcquisitionRow): VehicleAcquisition {
  return {
    purchasePriceVnd: row.purchasePriceVnd,
    purchasedOn: dayKey(row.purchasedOn),
    salvageValueVnd: row.salvageValueVnd,
    updatedAt: row.updatedAt.toISOString(),
    updatedById: row.updatedById,
    usefulLifeMonths: row.usefulLifeMonths,
    vehicleId: row.vehicleId,
  };
}

export function expenseWhere(filter: ExpenseFilter): Prisma.ExpenseWhereInput {
  const paidOn: Prisma.DateTimeFilter = {};
  if (filter.from) paidOn.gte = dayValue(filter.from);
  if (filter.to) paidOn.lte = dayValue(filter.to);
  return {
    ...(filter.category ? { category: filter.category } : {}),
    ...(filter.vehicleId ? { vehicleId: filter.vehicleId } : {}),
    ...(filter.from || filter.to ? { paidOn } : {}),
  };
}

export function expenseData(draft: ExpenseDraft): Prisma.ExpenseCreateInput {
  return {
    amountVnd: draft.amountVnd,
    category: draft.category,
    description: draft.description,
    idempotencyKey: draft.idempotencyKey,
    method: draft.method,
    notes: draft.notes,
    paidOn: dayValue(draft.paidOn),
    recordedById: draft.recordedById,
    reference: draft.reference,
    ...(draft.reversalOfId ? { reversalOf: { connect: { id: draft.reversalOfId } } } : {}),
    ...(draft.vehicleId ? { vehicle: { connect: { id: draft.vehicleId } } } : {}),
  };
}

@Injectable()
export class PrismaEconomicsRepository implements EconomicsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createExpense(draft: ExpenseDraft): Promise<ExpenseRecord> {
    try {
      const row = await this.prisma.expense.create({
        data: expenseData(draft),
        include: EXPENSE_INCLUDE,
      });
      return mapExpense(row);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new DomainError('CONFLICT', 'Khoản chi đã được ghi hoặc đã được đảo');
      }
      throw error;
    }
  }

  async findAcquisition(vehicleId: string): Promise<VehicleAcquisition | null> {
    const row = await this.prisma.vehicleAcquisition.findUnique({ where: { vehicleId } });
    return row ? mapAcquisition(row) : null;
  }

  async findExpense(id: string): Promise<ExpenseRecord | null> {
    const row = await this.prisma.expense.findUnique({ include: EXPENSE_INCLUDE, where: { id } });
    return row ? mapExpense(row) : null;
  }

  async findExpenseByKey(idempotencyKey: string): Promise<ExpenseRecord | null> {
    const row = await this.prisma.expense.findUnique({
      include: EXPENSE_INCLUDE,
      where: { idempotencyKey },
    });
    return row ? mapExpense(row) : null;
  }

  async listAcquisitions(): Promise<VehicleAcquisition[]> {
    const rows = await this.prisma.vehicleAcquisition.findMany();
    return rows.map(mapAcquisition);
  }

  async listExpenses(filter: ExpenseFilter): Promise<ExpenseRecord[]> {
    const rows = await this.prisma.expense.findMany({
      include: EXPENSE_INCLUDE,
      orderBy: [{ paidOn: 'desc' }, { createdAt: 'desc' }],
      ...(filter.limit === undefined ? {} : { take: filter.limit }),
      where: expenseWhere(filter),
    });
    return rows.map(mapExpense);
  }

  async upsertAcquisition(draft: AcquisitionDraft): Promise<VehicleAcquisition> {
    const data = {
      purchasePriceVnd: draft.purchasePriceVnd,
      purchasedOn: dayValue(draft.purchasedOn),
      salvageValueVnd: draft.salvageValueVnd,
      updatedById: draft.updatedById,
      usefulLifeMonths: draft.usefulLifeMonths,
    };
    const row = await this.prisma.vehicleAcquisition.upsert({
      create: { ...data, vehicle: { connect: { id: draft.vehicleId } } },
      update: data,
      where: { vehicleId: draft.vehicleId },
    });
    return mapAcquisition(row);
  }
}
