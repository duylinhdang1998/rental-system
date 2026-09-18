import type { DamageItem } from '@rental/contracts';
import { describe, expect, it } from 'vitest';
import {
  applyDamageItem,
  initialReturnForm,
  photoIssue,
  toReturnInput,
  toReturnSubmission,
} from '../../apps/admin/src/features/contracts/lib/return-form';
import { applyChargeItem } from '../../apps/admin/src/features/contracts/lib/settlement-presentation';

const ITEM: DamageItem = {
  active: true,
  code: 'GUONG',
  createdAt: '2026-09-18T00:00:00.000Z',
  id: 'item-1',
  name: 'Gương chiếu hậu',
  priceVnd: 150_000,
  updatedAt: '2026-09-18T00:00:00.000Z',
};
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

describe('Feature: Return form — damage catalog and photos (US-026)', () => {
  it('copies a catalog item into the return form and clears it for free text', () => {
    const changes: [string, unknown][] = [];
    const change = (field: string, value: unknown) => changes.push([field, value]);
    applyDamageItem(change, ITEM);
    expect(changes).toEqual([
      ['damageItemId', 'item-1'],
      ['chargeAmount', '150000'],
      ['chargeDescription', 'Gương chiếu hậu'],
    ]);
    applyDamageItem(change, null);
    expect(changes.slice(-3)).toEqual([
      ['damageItemId', ''],
      ['chargeAmount', ''],
      ['chargeDescription', ''],
    ]);
  });

  it('copies a catalog item into the manual charge form the same way', () => {
    const changes: [string, unknown][] = [];
    applyChargeItem((field: string, value: unknown) => changes.push([field, value]), ITEM);
    expect(changes).toEqual([
      ['damageItemId', 'item-1'],
      ['amount', '150000'],
      ['description', 'Gương chiếu hậu'],
    ]);
  });

  it('sends the item id for a DAMAGE charge and free text otherwise', () => {
    const form = initialReturnForm(new Date('2026-10-06T10:30:00.000Z'));
    const catalog = { ...form, chargeAmount: '150000', damageItemId: 'item-1' };
    expect(toReturnInput(catalog).charges).toEqual([{ damageItemId: 'item-1', kind: 'DAMAGE' }]);
    expect(toReturnInput({ ...catalog, chargeKind: 'OTHER' }).charges).toEqual([
      { amountVnd: 150_000, description: '', kind: 'OTHER' },
    ]);
    expect(toReturnInput(form, ['private/returns/hd-1/a.jpg']).imageObjectKeys).toEqual([
      'private/returns/hd-1/a.jpg',
    ]);
  });

  it('bundles the selected photos with the input and mirrors the upload limits', () => {
    const form = initialReturnForm(new Date('2026-10-06T10:30:00.000Z'));
    const photo = new File(['x'], 'a.jpg', { type: 'image/jpeg' });
    expect(toReturnSubmission({ ...form, photos: [photo] })).toEqual({
      input: toReturnInput(form),
      photos: [photo],
    });
    expect(photoIssue([])).toBeNull();
    expect(photoIssue([photo, photo, photo, photo, photo])).toBeNull();
    expect(photoIssue([photo, photo, photo, photo, photo, photo])).toBe('tooMany');
    const large = { size: MAX_PHOTO_BYTES + 1 } as File;
    expect(photoIssue([photo, large])).toBe('tooLarge');
  });
});
