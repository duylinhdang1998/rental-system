import type { INestApplication } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApiApp } from '../../apps/api/src/main';
import { LifecycleClient, PAST_INTERVAL } from './support/lifecycle-client';

const MIRROR = { code: 'guong-trai', name: 'Gương chiếu hậu trái', priceVnd: 120_000 };
const RETURN_INPUT = { actualReturnAt: PAST_INTERVAL.endAt, condition: 'GOOD', fuelPercent: 60 };

describe('Feature: Damage catalog and price list (US-026)', () => {
  let app: INestApplication;
  let staff: LifecycleClient;
  let owner: LifecycleClient;

  beforeEach(async () => {
    app = await createApiApp({ demoMode: true, nodeEnv: 'test' });
    staff = await new LifecycleClient(app).login();
    owner = await new LifecycleClient(app).login('owner', 'OwnerDemo!2026');
  });

  afterEach(async () => app.close());

  async function createMirror() {
    const response = await owner.post('/api/catalog/damage-items', MIRROR).expect(201);
    return response.body as { id: string };
  }

  it('lets the Owner maintain the list while Staff only reads active items', async () => {
    const created = await createMirror();
    expect(created).toMatchObject({ active: true, code: 'GUONG-TRAI', priceVnd: 120_000 });
    await owner.post('/api/catalog/damage-items', MIRROR).expect(409);
    await staff.post('/api/catalog/damage-items', MIRROR).expect(403);
    await owner.post('/api/catalog/damage-items', { ...MIRROR, code: 'A' }).expect(400);
    await owner
      .post('/api/catalog/damage-items', { code: 'BAO', name: 'Bao', priceVnd: 5 })
      .expect(201);

    const patched = await owner.agent
      .patch(`/api/catalog/damage-items/${created.id}`)
      .set('x-csrf-token', owner.csrf)
      .send({ active: false, priceVnd: 150_000 })
      .expect(200);
    expect(patched.body).toMatchObject({ active: false, priceVnd: 150_000 });
    await owner.agent
      .patch('/api/catalog/damage-items/missing')
      .set('x-csrf-token', owner.csrf)
      .send({ priceVnd: 1 })
      .expect(404);
    await staff.agent
      .patch(`/api/catalog/damage-items/${created.id}`)
      .set('x-csrf-token', staff.csrf)
      .send({ active: true })
      .expect(403);

    const forStaff = await staff.get('/api/catalog/damage-items?includeInactive=true').expect(200);
    expect(forStaff.body.items.map((item: { code: string }) => item.code)).toEqual(['BAO']);
    const forOwner = await owner.get('/api/catalog/damage-items?includeInactive=true').expect(200);
    expect(forOwner.body.items.map((item: { code: string }) => item.code)).toEqual([
      'BAO',
      'GUONG-TRAI',
    ]);
    await staff.get('/api/catalog/damage-items?includeInactive=maybe').expect(400);

    const audit = await owner.get('/api/audit?entityType=DamageItem').expect(200);
    expect(audit.body.items.map((item: { action: string }) => item.action)).toEqual(
      expect.arrayContaining(['DAMAGE_ITEM_CREATED', 'DAMAGE_ITEM_UPDATED']),
    );
    expect(audit.body.items[0].metadata).toMatchObject({
      afterPriceVnd: 150_000,
      beforePriceVnd: 120_000,
    });
  });

  it('prices a charge from the catalog at return and at settlement time, frozen thereafter', async () => {
    const mirror = await createMirror();
    const created = await staff.createActiveContract(['vehicle-001'], PAST_INTERVAL);
    const [lineId] = await staff.openLineIds(created.id);
    const returned = await staff
      .post(`/api/contracts/${created.id}/lines/${lineId}/return`, {
        ...RETURN_INPUT,
        charges: [{ damageItemId: mirror.id, kind: 'DAMAGE' }],
        condition: 'DAMAGED',
      })
      .expect(201);
    expect(returned.body.charges).toEqual([
      expect.objectContaining({
        amountVnd: 120_000,
        description: 'Gương chiếu hậu trái',
        kind: 'DAMAGE',
        lineId,
      }),
    ]);

    await owner.agent
      .patch(`/api/catalog/damage-items/${mirror.id}`)
      .set('x-csrf-token', owner.csrf)
      .send({ priceVnd: 200_000 })
      .expect(200);
    const charged = await staff
      .post(`/api/contracts/${created.id}/charges`, { damageItemId: mirror.id, kind: 'DAMAGE' })
      .expect(201);
    expect(charged.body.charges.map((charge: { amountVnd: number }) => charge.amountVnd)).toEqual([
      120_000, 200_000,
    ]);

    await staff
      .post(`/api/contracts/${created.id}/charges`, { damageItemId: 'missing', kind: 'DAMAGE' })
      .expect(404);
    await staff
      .post(`/api/contracts/${created.id}/charges`, { damageItemId: mirror.id, kind: 'OTHER' })
      .expect(400);
    await owner.agent
      .patch(`/api/catalog/damage-items/${mirror.id}`)
      .set('x-csrf-token', owner.csrf)
      .send({ active: false })
      .expect(200);
    const inactive = await staff
      .post(`/api/contracts/${created.id}/charges`, { damageItemId: mirror.id, kind: 'DAMAGE' })
      .expect(409);
    expect(inactive.body.error.code).toBe('DAMAGE_ITEM_INACTIVE');
    const statement = await staff.get(`/api/contracts/${created.id}/settlement`).expect(200);
    expect(statement.body.chargesVnd).toBe(470_000);
  });
});
