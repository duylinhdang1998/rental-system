import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { cashShiftStatusSchema } from '@rental/contracts';
import { DomainError } from '../../common/errors/domain.error.js';
import { PrismaService } from '../../database/prisma.service.js';
import type {
  CashShiftCloseDraft,
  CashShiftOpenDraft,
  CashShiftRecord,
  CashShiftRepository,
} from './cash-shift.types.js';

const UNIQUE_VIOLATION = 'P2002';

type CashShiftRow = Prisma.CashShiftGetPayload<Record<string, never>>;

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === UNIQUE_VIOLATION
  );
}

export function mapCashShift(row: CashShiftRow): CashShiftRecord {
  return {
    closedAt: row.closedAt?.toISOString() ?? null,
    closedById: row.closedById,
    countedCashVnd: row.countedCashVnd,
    expectedCashVnd: row.expectedCashVnd,
    id: row.id,
    note: row.note,
    openedAt: row.openedAt.toISOString(),
    openedById: row.openedById,
    openingFloatVnd: row.openingFloatVnd,
    status: cashShiftStatusSchema.parse(row.status),
    varianceVnd: row.varianceVnd,
  };
}

export function closeData(draft: CashShiftCloseDraft): Prisma.CashShiftUpdateInput {
  return {
    closedAt: new Date(draft.closedAt),
    closedById: draft.closedById,
    countedCashVnd: draft.countedCashVnd,
    expectedCashVnd: draft.expectedCashVnd,
    note: draft.note,
    status: 'CLOSED',
    varianceVnd: draft.varianceVnd,
  };
}

@Injectable()
export class PrismaCashShiftRepository implements CashShiftRepository {
  constructor(private readonly prisma: PrismaService) {}

  async close(id: string, draft: CashShiftCloseDraft): Promise<CashShiftRecord> {
    return mapCashShift(
      await this.prisma.cashShift.update({ data: closeData(draft), where: { id } }),
    );
  }

  /** The partial unique index on OPEN rows turns a concurrent second open into P2002. */
  async create(draft: CashShiftOpenDraft): Promise<CashShiftRecord> {
    try {
      const row = await this.prisma.cashShift.create({
        data: {
          openedAt: new Date(draft.openedAt),
          openedById: draft.openedById,
          openingFloatVnd: draft.openingFloatVnd,
        },
      });
      return mapCashShift(row);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new DomainError('CASH_SHIFT_ALREADY_OPEN', 'Đang có một ca mở');
      }
      throw error;
    }
  }

  async findById(id: string): Promise<CashShiftRecord | null> {
    const row = await this.prisma.cashShift.findUnique({ where: { id } });
    return row ? mapCashShift(row) : null;
  }

  async findOpen(): Promise<CashShiftRecord | null> {
    const row = await this.prisma.cashShift.findFirst({ where: { status: 'OPEN' } });
    return row ? mapCashShift(row) : null;
  }

  async list(openedById?: string): Promise<CashShiftRecord[]> {
    const rows = await this.prisma.cashShift.findMany({
      orderBy: { openedAt: 'desc' },
      where: openedById === undefined ? {} : { openedById },
    });
    return rows.map(mapCashShift);
  }
}
