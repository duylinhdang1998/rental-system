import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { DamageItem } from '@rental/contracts';
import { DomainError } from '../../common/errors/domain.error.js';
import { PrismaService } from '../../database/prisma.service.js';
import type {
  DamageCatalogRepository,
  DamageItemDraft,
  DamageItemPatch,
} from './damage-catalog.types.js';

const UNIQUE_VIOLATION = 'P2002';

type DamageItemRow = Prisma.DamageItemGetPayload<Record<string, never>>;

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === UNIQUE_VIOLATION
  );
}

export function mapDamageItem(row: DamageItemRow): DamageItem {
  return {
    active: row.active,
    code: row.code,
    createdAt: row.createdAt.toISOString(),
    id: row.id,
    name: row.name,
    priceVnd: row.priceVnd,
    updatedAt: row.updatedAt.toISOString(),
  };
}

@Injectable()
export class PrismaDamageCatalogRepository implements DamageCatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(draft: DamageItemDraft): Promise<DamageItem> {
    try {
      return mapDamageItem(await this.prisma.damageItem.create({ data: draft }));
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new DomainError('DAMAGE_ITEM_EXISTS', 'Mã hạng mục đã tồn tại');
      }
      throw error;
    }
  }

  async findById(id: string): Promise<DamageItem | null> {
    const row = await this.prisma.damageItem.findUnique({ where: { id } });
    return row ? mapDamageItem(row) : null;
  }

  async list(includeInactive: boolean): Promise<DamageItem[]> {
    const rows = await this.prisma.damageItem.findMany({
      orderBy: { code: 'asc' },
      where: includeInactive ? {} : { active: true },
    });
    return rows.map(mapDamageItem);
  }

  async update(id: string, patch: DamageItemPatch): Promise<DamageItem> {
    return mapDamageItem(await this.prisma.damageItem.update({ data: patch, where: { id } }));
  }
}
