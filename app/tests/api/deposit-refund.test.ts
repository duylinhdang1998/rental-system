import type { INestApplication } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AuditService } from '../../apps/api/src/common/audit/audit.service';
import { createApiApp } from '../../apps/api/src/main';
import { LifecycleClient, PAST_INTERVAL } from './support/lifecycle-client';

const RETURN_INPUT = { actualReturnAt: PAST_INTERVAL.endAt, condition: 'GOOD', fuelPercent: 60 };
const DAY_MS = 86_400_000;
const day = (offset: number) => new Date(Date.now() + offset * DAY_MS).toISOString().slice(0, 10);
/** Yesterday to tomorrow, so the refund recorded "now" sits inside the window in any zone. */
const RANGE = `from=${day(-1)}&to=${day(1)}`;

function refund(overrides: object = {}) {
  return { idempotencyKey: crypto.randomUUID(), method: 'CASH', ...overrides };
}

describe('Feature: Deposit refund as its own ledger row (US-028, PD-17, BR-11)', () => {
  let app: INestApplication;
  let staff: LifecycleClient;

  beforeEach(async () => {
    app = await createApiApp({ demoMode: true, nodeEnv: 'test' });
    staff = await new LifecycleClient(app).login();
  });

  afterEach(async () => app.close());

  async function returnedContract(depositVnd: number) {
    const created = await staff.createActiveContract(['vehicle-001'], PAST_INTERVAL, {
      depositVnd,
    });
    const [lineId] = await staff.openLineIds(created.id);
    await staff
      .post(`/api/contracts/${created.id}/lines/${lineId}/return`, RETURN_INPUT)
      .expect(201);
    return created;
  }

  it('refunds exactly the frozen settlement refund once, idempotently, outside revenue', async () => {
    const created = await returnedContract(500_000);
    const refundPath = `/api/contracts/${created.id}/deposit-refund`;
    const early = await staff.post(refundPath, refund()).expect(409);
    expect(early.body.error.code).toBe('CONTRACT_NOT_SETTLED');

    const settled = await staff.post(`/api/contracts/${created.id}/settle`).expect(201);
    expect(settled.body.settlement).toMatchObject({ depositRefunded: false, refundVnd: 350_000 });

    const body = refund({ notes: 'Trả cọc tiền mặt' });
    const refunded = await staff.post(refundPath, body).expect(201);
    expect(refunded.body.settlement.depositRefunded).toBe(true);
    expect(refunded.body.payments).toEqual([
      expect.objectContaining({ amountVnd: 350_000, kind: 'DEPOSIT_REFUND', method: 'CASH' }),
    ]);
    expect(refunded.body.events.at(-1)).toMatchObject({
      metadata: { amountVnd: 350_000, method: 'CASH' },
      reason: 'Trả cọc tiền mặt',
      type: 'DEPOSIT_REFUNDED',
    });
    const replay = await staff.post(refundPath, body).expect(201);
    expect(replay.body.payments).toHaveLength(1);
    const again = await staff.post(refundPath, refund()).expect(409);
    expect(again.body.error.code).toBe('DEPOSIT_ALREADY_REFUNDED');
    await staff
      .post(`/api/contracts/${created.id}/payments`, { ...body, amountVnd: 1 })
      .expect(409);

    const ledger = await staff.get(`/api/contracts/${created.id}/ledger`).expect(200);
    expect(ledger.body.balance).toMatchObject({
      depositRefundedVnd: 350_000,
      paidVnd: 0,
      refundedVnd: 0,
      remainingVnd: 0,
    });
    expect(ledger.body.entries[0]).toMatchObject({
      kind: 'DEPOSIT_REFUND',
      receivedByName: 'Nhân viên',
    });
    expect(await app.get(AuditService).list()).toContainEqual(
      expect.objectContaining({
        action: 'CONTRACT_DEPOSIT_REFUNDED',
        entityId: created.id,
        metadata: { amountVnd: 350_000, method: 'CASH' },
      }),
    );

    const owner = await new LifecycleClient(app).login('owner', 'OwnerDemo!2026');
    const report = await owner.get(`/api/reports/revenue?${RANGE}`).expect(200);
    expect(report.body.totals).toMatchObject({ netVnd: 0, paymentCount: 0, refundVnd: 0 });
  });

  it('refuses when nothing is due, validates the body and keeps the CSRF gate', async () => {
    const created = await returnedContract(0);
    await staff.post(`/api/contracts/${created.id}/settle`).expect(201);
    const nothing = await staff
      .post(`/api/contracts/${created.id}/deposit-refund`, refund())
      .expect(409);
    expect(nothing.body.error.code).toBe('NO_DEPOSIT_REFUND_DUE');
    await staff
      .post(`/api/contracts/${created.id}/deposit-refund`, refund({ amountVnd: 1 }))
      .expect(400);
    await staff
      .post(`/api/contracts/${created.id}/deposit-refund`, refund({ method: 'GOLD' }))
      .expect(400);
    await staff.post('/api/contracts/missing/deposit-refund', refund()).expect(404);
    await staff.agent
      .post(`/api/contracts/${created.id}/deposit-refund`)
      .send(refund())
      .expect(403);
  });
});
