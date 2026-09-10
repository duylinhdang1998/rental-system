import type { INestApplication } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AuditService } from '../../apps/api/src/common/audit/audit.service';
import { createApiApp } from '../../apps/api/src/main';
import { LifecycleClient, PAST_INTERVAL } from './support/lifecycle-client';

const RETURN_INPUT = { actualReturnAt: PAST_INTERVAL.endAt, condition: 'GOOD', fuelPercent: 60 };

function payment(overrides: object = {}) {
  return { amountVnd: 100_000, idempotencyKey: crypto.randomUUID(), method: 'CASH', ...overrides };
}

describe('Feature: Payments — multi-method ledger with caps and idempotency (FR-08, BR-04)', () => {
  let app: INestApplication;
  let staff: LifecycleClient;

  beforeEach(async () => {
    app = await createApiApp({ demoMode: true, nodeEnv: 'test' });
    staff = await new LifecycleClient(app).login();
  });

  afterEach(async () => app.close());

  it('collects in two methods, names the cashier and updates the balance', async () => {
    const created = await staff.createActiveContract(['vehicle-001'], PAST_INTERVAL);
    const pay = (body: object) => staff.post(`/api/contracts/${created.id}/payments`, body);
    const cash = await pay(payment({ notes: 'Thu tại quầy' })).expect(201);
    expect(cash.body.payments).toHaveLength(1);
    expect(cash.body.events.at(-1)).toMatchObject({
      metadata: { amountVnd: 100_000, kind: 'PAYMENT', method: 'CASH' },
      reason: 'Thu tại quầy',
      type: 'PAYMENT_RECORDED',
    });
    await pay(payment({ amountVnd: 50_000, method: 'BANK_TRANSFER', reference: 'FT2026' })).expect(
      201,
    );

    const ledger = await staff.get(`/api/contracts/${created.id}/ledger`).expect(200);
    expect(ledger.body).toMatchObject({
      balance: {
        cashVnd: 100_000,
        paidVnd: 150_000,
        refundedVnd: 0,
        remainingVnd: 0,
        totalDueVnd: 150_000,
        transferVnd: 50_000,
      },
      code: created.code,
      contractId: created.id,
      paymentAllowed: true,
      settledAt: null,
    });
    const entries = ledger.body.entries as { receivedByName: string; reference: string }[];
    expect(entries.map((entry) => [entry.receivedByName, entry.reference])).toEqual([
      ['Nhân viên', ''],
      ['Nhân viên', 'FT2026'],
    ]);
    expect(await app.get(AuditService).list()).toContainEqual(
      expect.objectContaining({ action: 'CONTRACT_PAYMENT_RECORDED', entityId: created.id }),
    );
  });

  it('caps collections at the outstanding amount and refunds at the net collected', async () => {
    const created = await staff.createActiveContract(['vehicle-001'], PAST_INTERVAL);
    const pay = (body: object) => staff.post(`/api/contracts/${created.id}/payments`, body);
    const over = await pay(payment({ amountVnd: 200_000 })).expect(400);
    expect(over.body.error.code).toBe('INVALID_INPUT');
    expect(over.body.message).toContain('Thu tối đa 150.000');
    await pay(payment()).expect(201);
    const refundOver = await pay(payment({ amountVnd: 120_000, kind: 'REFUND' })).expect(400);
    expect(refundOver.body.message).toContain('Hoàn tối đa 100.000');
    const refunded = await pay(
      payment({ amountVnd: 30_000, kind: 'REFUND', notes: 'Trả lại tiền thừa' }),
    ).expect(201);
    expect(refunded.body.events.at(-1)).toMatchObject({
      metadata: { amountVnd: 30_000, kind: 'REFUND', method: 'CASH' },
      reason: 'Trả lại tiền thừa',
      type: 'REFUND_RECORDED',
    });
    const ledger = await staff.get(`/api/contracts/${created.id}/ledger`).expect(200);
    expect(ledger.body.balance).toMatchObject({
      paidVnd: 70_000,
      refundedVnd: 30_000,
      remainingVnd: 80_000,
    });
    expect(await app.get(AuditService).list()).toContainEqual(
      expect.objectContaining({ action: 'CONTRACT_REFUND_RECORDED', entityId: created.id }),
    );
  });

  it('replays the same idempotency key without a second row and rejects a reused key', async () => {
    const created = await staff.createActiveContract(['vehicle-001'], PAST_INTERVAL);
    const body = payment({ amountVnd: 60_000 });
    const pay = (input: object) => staff.post(`/api/contracts/${created.id}/payments`, input);
    await pay(body).expect(201);
    const replay = await pay(body).expect(201);
    expect(replay.body.payments).toHaveLength(1);
    const reused = await pay({ ...body, amountVnd: 70_000 }).expect(409);
    expect(reused.body.error.code).toBe('CONFLICT');
    const other = await staff.createActiveContract(['vehicle-002'], PAST_INTERVAL);
    await staff.post(`/api/contracts/${other.id}/payments`, body).expect(409);
    const ledger = await staff.get(`/api/contracts/${created.id}/ledger`).expect(200);
    expect(ledger.body.balance.paidVnd).toBe(60_000);
    expect(ledger.body.entries).toHaveLength(1);
  });

  it('rejects malformed input and money on cancelled contracts', async () => {
    const created = await staff.createActiveContract(['vehicle-001'], PAST_INTERVAL);
    const pay = (input: object) => staff.post(`/api/contracts/${created.id}/payments`, input);
    await pay(payment({ amountVnd: 0 })).expect(400);
    await pay(payment({ idempotencyKey: 'not-a-uuid' })).expect(400);
    await pay(payment({ method: 'CRYPTO' })).expect(400);
    await pay({ ...payment(), extra: true }).expect(400);
    const booking = await staff.createContract(['vehicle-003']);
    await staff
      .post(`/api/contracts/${booking.id}/cancel`, { reason: 'Khách đổi lịch' })
      .expect(201);
    const blocked = await staff
      .post(`/api/contracts/${booking.id}/payments`, payment())
      .expect(409);
    expect(blocked.body.error.code).toBe('INVALID_TRANSITION');
    await staff.post('/api/contracts/missing/payments', payment()).expect(404);
    const ledger = await staff.get(`/api/contracts/${booking.id}/ledger`).expect(200);
    expect(ledger.body).toMatchObject({ entries: [], paymentAllowed: false });
  });

  it('keeps collecting after settlement until the frozen receivable is cleared (BR-07)', async () => {
    const created = await staff.createActiveContract(['vehicle-001'], PAST_INTERVAL);
    const [lineId] = await staff.openLineIds(created.id);
    await staff
      .post(`/api/contracts/${created.id}/lines/${lineId}/return`, RETURN_INPUT)
      .expect(201);
    const pay = (input: object) => staff.post(`/api/contracts/${created.id}/payments`, input);
    await pay(payment({ amountVnd: 50_000 })).expect(201);
    const settled = await staff.post(`/api/contracts/${created.id}/settle`).expect(201);
    expect(settled.body.settlement).toMatchObject({ paidVnd: 50_000, receivableVnd: 100_000 });
    await pay(payment({ amountVnd: 100_000, method: 'BANK_TRANSFER' })).expect(201);
    const ledger = await staff.get(`/api/contracts/${created.id}/ledger`).expect(200);
    expect(ledger.body).toMatchObject({
      balance: { paidVnd: 150_000, remainingVnd: 0 },
      paymentAllowed: true,
      settledAt: expect.any(String),
    });
    const frozen = await staff.get(`/api/contracts/${created.id}`).expect(200);
    expect(frozen.body.settlement).toMatchObject({ paidVnd: 50_000, receivableVnd: 100_000 });
    const overCap = await pay(payment({ amountVnd: 1 })).expect(400);
    expect(overCap.body.message).toContain('Thu tối đa 0');
  });
});
