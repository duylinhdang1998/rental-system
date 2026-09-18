import {
  contractChargeInputSchema,
  damageItemInputSchema,
  damageItemListQuerySchema,
  inspectionChargeInputSchema,
  type DamageItem,
} from '@rental/contracts';
import { describe, expect, it } from 'vitest';
import { DomainError } from '../../apps/api/src/common/errors/domain.error';
import { ChargePricingService } from '../../apps/api/src/modules/contracts/contract-charge.pricing';
import type { DamageCatalogRepository } from '../../apps/api/src/modules/damage-catalog/damage-catalog.types';
import { DemoDamageCatalogRepository } from '../../apps/api/src/modules/damage-catalog/demo-damage-catalog.repository';

const NOW = '2026-09-18T03:00:00.000Z';

function item(overrides: Partial<DamageItem> = {}): DamageItem {
  return {
    active: true,
    code: 'GUONG-TRAI',
    createdAt: NOW,
    id: 'item-1',
    name: 'Gương trái',
    priceVnd: 120_000,
    updatedAt: NOW,
    ...overrides,
  };
}

function catalogWith(items: DamageItem[]): DamageCatalogRepository {
  return {
    create: () => Promise.reject(new Error('not used')),
    findById: (id) => Promise.resolve(items.find((entry) => entry.id === id) ?? null),
    list: () => Promise.resolve(items),
    update: () => Promise.reject(new Error('not used')),
  };
}

describe('Feature: Damage catalog — shared schemas (US-026)', () => {
  it('normalises the code, bounds the price and parses the list flag', () => {
    expect(
      damageItemInputSchema.parse({ code: ' guong-trai ', name: 'Gương trái', priceVnd: 0 }),
    ).toMatchObject({ code: 'GUONG-TRAI', priceVnd: 0 });
    expect(() => damageItemInputSchema.parse({ code: 'A', name: 'Gương', priceVnd: 1 })).toThrow();
    expect(() =>
      damageItemInputSchema.parse({ code: 'AB', name: 'Gương', priceVnd: -1 }),
    ).toThrow();
    expect(() =>
      damageItemInputSchema.parse({ code: 'AB', extra: 1, name: 'Gương', priceVnd: 1 }),
    ).toThrow();
    expect(damageItemListQuerySchema.parse({})).toEqual({ includeInactive: false });
    expect(damageItemListQuerySchema.parse({ includeInactive: 'true' })).toEqual({
      includeInactive: true,
    });
  });

  it('accepts a catalog item only on a DAMAGE charge and free text only with amount and reason', () => {
    expect(
      contractChargeInputSchema.safeParse({ damageItemId: 'item-1', kind: 'DAMAGE' }).success,
    ).toBe(true);
    expect(
      contractChargeInputSchema.safeParse({ damageItemId: 'item-1', kind: 'OTHER' }).success,
    ).toBe(false);
    expect(contractChargeInputSchema.safeParse({ kind: 'OTHER' }).success).toBe(false);
    expect(contractChargeInputSchema.safeParse({ amountVnd: 1000, kind: 'OTHER' }).success).toBe(
      false,
    );
    expect(
      contractChargeInputSchema.safeParse({ amountVnd: 1000, description: 'Rửa xe', kind: 'OTHER' })
        .success,
    ).toBe(true);
    const result = inspectionChargeInputSchema.safeParse({ kind: 'DAMAGE' });
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.issues)).toContain('Chọn hạng mục hư hỏng');
  });
});

describe('Feature: Damage catalog — pricing a charge from the catalog', () => {
  it('copies the price and name of an active item and links the item in the metadata', async () => {
    const pricing = new ChargePricingService(catalogWith([item()]));
    await expect(pricing.price({ damageItemId: 'item-1' })).resolves.toEqual({
      amountVnd: 120_000,
      description: 'Gương trái',
      metadata: { damageItemCode: 'GUONG-TRAI', damageItemId: 'item-1' },
    });
    await expect(pricing.price({ amountVnd: 50_000, description: 'Rửa xe' })).resolves.toEqual({
      amountVnd: 50_000,
      description: 'Rửa xe',
    });
  });

  it('refuses unknown, inactive and unpriced items and free text without both fields', async () => {
    const pricing = new ChargePricingService(
      catalogWith([item({ active: false, id: 'off' }), item({ id: 'free', priceVnd: 0 })]),
    );
    await expect(pricing.price({ damageItemId: 'missing' })).rejects.toMatchObject(
      new DomainError('DAMAGE_ITEM_NOT_FOUND', 'Không tìm thấy hạng mục hư hỏng'),
    );
    await expect(pricing.price({ damageItemId: 'off' })).rejects.toMatchObject({
      code: 'DAMAGE_ITEM_INACTIVE',
    });
    await expect(pricing.price({ damageItemId: 'free' })).rejects.toMatchObject({
      code: 'INVALID_INPUT',
    });
    await expect(pricing.price({ amountVnd: 1 })).rejects.toMatchObject({ code: 'INVALID_INPUT' });
  });
});

describe('Feature: Damage catalog — demo repository', () => {
  it('rejects a duplicate code, sorts by code and hides inactive items unless asked', async () => {
    const repository = new DemoDamageCatalogRepository();
    const mirror = await repository.create({ code: 'GUONG', name: 'Gương', priceVnd: 120_000 });
    await repository.create({ code: 'BAO-DIEN', name: 'Bao điện', priceVnd: 30_000 });
    await expect(
      repository.create({ code: 'GUONG', name: 'Gương phải', priceVnd: 1 }),
    ).rejects.toMatchObject({ code: 'DAMAGE_ITEM_EXISTS' });
    await repository.update(mirror.id, { active: false });
    expect((await repository.list(false)).map((entry) => entry.code)).toEqual(['BAO-DIEN']);
    expect((await repository.list(true)).map((entry) => entry.code)).toEqual(['BAO-DIEN', 'GUONG']);
    await expect(repository.findById(mirror.id)).resolves.toMatchObject({ active: false });
    await expect(repository.findById('missing')).resolves.toBeNull();
    await expect(repository.update('missing', { priceVnd: 1 })).rejects.toMatchObject({
      code: 'DAMAGE_ITEM_NOT_FOUND',
    });
  });
});
