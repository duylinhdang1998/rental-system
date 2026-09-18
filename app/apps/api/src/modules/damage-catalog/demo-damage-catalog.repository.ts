import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { DamageItem } from '@rental/contracts';
import { DomainError } from '../../common/errors/domain.error.js';
import type {
  DamageCatalogRepository,
  DamageItemDraft,
  DamageItemPatch,
} from './damage-catalog.types.js';

export function compareDamageItems(left: DamageItem, right: DamageItem): number {
  return left.code.localeCompare(right.code);
}

@Injectable()
export class DemoDamageCatalogRepository implements DamageCatalogRepository {
  private readonly items: DamageItem[] = [];

  create(draft: DamageItemDraft): Promise<DamageItem> {
    if (this.items.some((item) => item.code === draft.code)) {
      return Promise.reject(new DomainError('DAMAGE_ITEM_EXISTS', 'Mã hạng mục đã tồn tại'));
    }
    const now = new Date().toISOString();
    const item: DamageItem = {
      ...draft,
      active: true,
      createdAt: now,
      id: randomUUID(),
      updatedAt: now,
    };
    this.items.push(item);
    return Promise.resolve({ ...item });
  }

  findById(id: string): Promise<DamageItem | null> {
    const item = this.items.find((candidate) => candidate.id === id);
    return Promise.resolve(item ? { ...item } : null);
  }

  list(includeInactive: boolean): Promise<DamageItem[]> {
    return Promise.resolve(
      this.items
        .filter((item) => includeInactive || item.active)
        .sort(compareDamageItems)
        .map((item) => ({ ...item })),
    );
  }

  update(id: string, patch: DamageItemPatch): Promise<DamageItem> {
    const item = this.items.find((candidate) => candidate.id === id);
    if (!item) {
      return Promise.reject(
        new DomainError('DAMAGE_ITEM_NOT_FOUND', 'Không tìm thấy hạng mục hư hỏng'),
      );
    }
    Object.assign(item, patch, { updatedAt: new Date().toISOString() });
    return Promise.resolve({ ...item });
  }
}
