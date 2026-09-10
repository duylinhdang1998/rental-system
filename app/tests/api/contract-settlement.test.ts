import type { INestApplication } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AuditService } from '../../apps/api/src/common/audit/audit.service';
import { createApiApp } from '../../apps/api/src/main';
import { LifecycleClient, PAST_INTERVAL, type HandoverOverrides } from './support/lifecycle-client';

const RETURN_INPUT = { actualReturnAt: PAST_INTERVAL.endAt, condition: 'GOOD', fuelPercent: 60 };
const DAMAGE = { amountVnd: 100_000, description: 'Trầy yếm trước', kind: 'DAMAGE' };
const CHECKLIST = { depositRefunded: true, documentReturned: true };

describe('Feature: Return and settlement — charges and settlement', () => {
  let app: INestApplication;
  let staff: LifecycleClient;

  beforeEach(async () => {
    app = await createApiApp({ demoMode: true, nodeEnv: 'test' });
    staff = await new LifecycleClient(app).login();
  });

  afterEach(async () => app.close());

  async function returnedContract(handover: HandoverOverrides = {}) {
    const created = await staff.createActiveContract(['vehicle-001'], PAST_INTERVAL, handover);
    const [lineId] = await staff.openLineIds(created.id);
    await staff
      .post(`/api/contracts/${created.id}/lines/${lineId}/return`, RETURN_INPUT)
      .expect(201);
    return { created, lineId: lineId! };
  }

  it('records surcharges with a reason and keeps discounts Owner-only (BR-06)', async () => {
    const { created, lineId } = await returnedContract();
    const charged = await staff
      .post(`/api/contracts/${created.id}/charges`, { ...DAMAGE, lineId })
      .expect(201);
    expect(charged.body.charges[0]).toMatchObject({ ...DAMAGE, lineId, vehicleCode: 'XE-001' });
    expect(charged.body.events.at(-1)).toMatchObject({
      metadata: { amountVnd: 100_000, kind: 'DAMAGE', vehicleCode: 'XE-001' },
      reason: 'Trầy yếm trước',
      type: 'CHARGE_ADDED',
    });
    const discount = { amountVnd: 30_000, description: 'Khách quen', kind: 'DISCOUNT' };
    const forbidden = await staff
      .post(`/api/contracts/${created.id}/charges`, discount)
      .expect(403);
    expect(forbidden.body.error.code).toBe('FORBIDDEN');
    const owner = await new LifecycleClient(app).login('owner', 'OwnerDemo!2026');
    await owner.post(`/api/contracts/${created.id}/charges`, discount).expect(201);

    const statement = await staff.get(`/api/contracts/${created.id}/settlement`).expect(200);
    expect(statement.body).toMatchObject({
      chargesVnd: 250_000,
      discountsVnd: 30_000,
      receivableVnd: 220_000,
      refundVnd: 0,
      totalDueVnd: 220_000,
    });
    expect(statement.body.items.map((item: { kind: string }) => item.kind)).toEqual([
      'RENTAL',
      'DAMAGE',
      'DISCOUNT',
    ]);
    expect(await app.get(AuditService).list()).toContainEqual(
      expect.objectContaining({ action: 'CONTRACT_CHARGE_ADDED', entityId: created.id }),
    );
  });

  it('rejects malformed charges and charges on contracts that are not chargeable', async () => {
    const { created } = await returnedContract();
    await staff
      .post(`/api/contracts/${created.id}/charges`, { ...DAMAGE, amountVnd: 0 })
      .expect(400);
    await staff
      .post(`/api/contracts/${created.id}/charges`, { ...DAMAGE, description: 'ab' })
      .expect(400);
    await staff
      .post(`/api/contracts/${created.id}/charges`, { ...DAMAGE, lineId: 'nope' })
      .expect(404);
    const reserved = await staff.createContract(['vehicle-003']);
    const blocked = await staff.post(`/api/contracts/${reserved.id}/charges`, DAMAGE).expect(409);
    expect(blocked.body.error.code).toBe('INVALID_TRANSITION');
  });

  it('settles with an explicit refund after the checklist and the deposit cap (BR-04)', async () => {
    const { created } = await returnedContract({
      depositVnd: 500_000,
      retainedDocument: 'CCCD 0000',
    });
    const preview = await staff.get(`/api/contracts/${created.id}/settlement`).expect(200);
    expect(preview.body).toMatchObject({
      depositAppliedVnd: 150_000,
      outstandingVnd: 150_000,
      ready: true,
      receivableVnd: 0,
      refundVnd: 350_000,
      totalDueVnd: 150_000,
    });
    const settle = (input: object) => staff.post(`/api/contracts/${created.id}/settle`, input);
    expect((await settle({}).expect(400)).body.message).toContain('giấy tờ');
    expect((await settle({ documentReturned: true }).expect(400)).body.message).toContain(
      'hoàn cọc',
    );
    const overCap = await settle({ ...CHECKLIST, depositAppliedVnd: 200_000 }).expect(400);
    expect(overCap.body.message).toContain('150.000');

    const settled = await settle({ ...CHECKLIST, notes: 'Hoàn cọc tiền mặt' }).expect(201);
    expect(settled.body.settledAt).toEqual(expect.any(String));
    expect(settled.body.settlement).toMatchObject({
      ...CHECKLIST,
      depositAppliedVnd: 150_000,
      notes: 'Hoàn cọc tiền mặt',
      receivableVnd: 0,
      refundVnd: 350_000,
      totalDueVnd: 150_000,
    });
    expect(settled.body.events.at(-1)).toMatchObject({
      metadata: {
        depositAppliedVnd: 150_000,
        receivableVnd: 0,
        refundVnd: 350_000,
        totalDueVnd: 150_000,
      },
      reason: 'Hoàn cọc tiền mặt',
      type: 'SETTLED',
    });
    expect(await app.get(AuditService).list()).toContainEqual(
      expect.objectContaining({ action: 'CONTRACT_SETTLED', entityId: created.id }),
    );
  });

  it('freezes a settled contract: no more charges, no second settlement (BR-07)', async () => {
    const { created } = await returnedContract();
    await staff.post(`/api/contracts/${created.id}/settle`).expect(201);
    await staff.post(`/api/contracts/${created.id}/charges`, DAMAGE).expect(409);
    const again = await staff.post(`/api/contracts/${created.id}/settle`).expect(409);
    expect(again.body.message).toContain('đã tất toán');
    const statement = await staff.get(`/api/contracts/${created.id}/settlement`).expect(200);
    expect(statement.body).toMatchObject({
      ready: false,
      receivableVnd: 150_000,
      settledAt: expect.any(String),
    });
    const list = await staff.get('/api/contracts?status=COMPLETED').expect(200);
    expect(list.body.items).toContainEqual(
      expect.objectContaining({ id: created.id, settledAt: expect.any(String) }),
    );
  });

  it('applies the deposit partially when asked and reports both directions', async () => {
    const { created } = await returnedContract({ depositVnd: 100_000 });
    await staff
      .post(`/api/contracts/${created.id}/charges`, { ...DAMAGE, amountVnd: 200_000 })
      .expect(201);
    const settled = await staff
      .post(`/api/contracts/${created.id}/settle`, {
        depositAppliedVnd: 50_000,
        depositRefunded: true,
      })
      .expect(201);
    expect(settled.body.settlement).toMatchObject({
      chargesVnd: 350_000,
      depositAppliedVnd: 50_000,
      receivableVnd: 300_000,
      refundVnd: 50_000,
    });
  });
});
