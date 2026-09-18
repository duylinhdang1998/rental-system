import type { DamageItem } from '@rental/contracts';
import { describe, expect, it } from 'vitest';
import {
  INITIAL_DAMAGE_ITEM_FORM,
  activeDamageItems,
  damageItemBlocked,
  damageItemFormFrom,
  damageItemTone,
  toDamageItemInput,
  toDamageItemUpdate,
} from '../../apps/admin/src/features/settings/lib/damage-catalog-presentation';

const ITEM: DamageItem = {
  active: true,
  code: 'GUONG',
  createdAt: '2026-09-10T03:00:00.000Z',
  id: 'damage-1',
  name: 'Gương chiếu hậu',
  priceVnd: 150_000,
  updatedAt: '2026-09-10T03:00:00.000Z',
};

describe('Feature: Damage catalog — form, validation and row presentation', () => {
  it('starts from an empty form and mirrors an existing item for edit', () => {
    expect(INITIAL_DAMAGE_ITEM_FORM).toEqual({ active: true, code: '', name: '', priceVnd: '' });
    expect(damageItemFormFrom(ITEM)).toEqual({
      active: true,
      code: 'GUONG',
      name: 'Gương chiếu hậu',
      priceVnd: '150000',
    });
    expect(damageItemFormFrom({ ...ITEM, active: false }).active).toBe(false);
  });

  it('trims and upper-cases the code when building the create payload', () => {
    const form = { active: true, code: ' guong ', name: ' Gương chiếu hậu ', priceVnd: '150000' };
    expect(toDamageItemInput(form)).toEqual({
      code: 'GUONG',
      name: 'Gương chiếu hậu',
      priceVnd: 150_000,
    });
    expect(toDamageItemInput({ ...form, priceVnd: 'abc' }).priceVnd).toBe(0);
  });

  it('sends only the fields that changed from the stored item on update', () => {
    const form = damageItemFormFrom(ITEM);
    expect(toDamageItemUpdate(form, ITEM)).toEqual({});
    expect(toDamageItemUpdate({ ...form, name: 'Gương mới' }, ITEM)).toEqual({
      name: 'Gương mới',
    });
    expect(toDamageItemUpdate({ ...form, priceVnd: '200000' }, ITEM)).toEqual({
      priceVnd: 200_000,
    });
    expect(toDamageItemUpdate({ ...form, active: false }, ITEM)).toEqual({ active: false });
    expect(
      toDamageItemUpdate(
        { active: false, code: 'GUONG', name: 'Gương mới', priceVnd: '200000' },
        ITEM,
      ),
    ).toEqual({ active: false, name: 'Gương mới', priceVnd: 200_000 });
  });

  it('mirrors damageItemInputSchema: a short code, a short name and a bad price all block save', () => {
    const form = damageItemFormFrom(ITEM);
    expect(damageItemBlocked(form)).toBe(false);
    expect(damageItemBlocked({ ...form, code: 'G' })).toBe(true);
    expect(damageItemBlocked({ ...form, name: 'G' })).toBe(true);
    expect(damageItemBlocked({ ...form, priceVnd: '-1' })).toBe(true);
    expect(damageItemBlocked({ ...form, priceVnd: '12.5' })).toBe(true);
    expect(damageItemBlocked({ ...form, priceVnd: '' })).toBe(true);
    expect(damageItemBlocked({ ...form, priceVnd: '1000000001' })).toBe(true);
    expect(damageItemBlocked({ ...form, priceVnd: '0' })).toBe(false);
  });

  it('maps active state to the badge tone', () => {
    expect(damageItemTone(ITEM)).toBe('success');
    expect(damageItemTone({ ...ITEM, active: false })).toBe('info');
  });

  it('keeps only active items for pickers elsewhere, sorted by code', () => {
    const yem = { ...ITEM, active: false, code: 'YEM', id: 'damage-2' };
    const banGuong = { ...ITEM, code: 'BANGUONG', id: 'damage-3' };
    expect(activeDamageItems([yem, ITEM, banGuong]).map((item) => item.code)).toEqual([
      'BANGUONG',
      'GUONG',
    ]);
  });
});
