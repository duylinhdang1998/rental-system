import type { INestApplication } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AuditService } from '../../apps/api/src/common/audit/audit.service';
import { createApiApp } from '../../apps/api/src/main';
import { LifecycleClient, PAST_INTERVAL } from './support/lifecycle-client';

const RETURN_INPUT = { actualReturnAt: PAST_INTERVAL.endAt, condition: 'GOOD', fuelPercent: 60 };

function payment(overrides: object = {}) {
  return { amountVnd: 100_000, idempotencyKey: crypto.randomUUID(), method: 'CASH', ...overrides };
}

function expense(overrides: object = {}) {
  return {
    amountVnd: 40_000,
    category: 'FUEL',
    description: 'Đổ xăng',
    idempotencyKey: crypto.randomUUID(),
    method: 'CASH',
    paidOn: '2026-09-18',
    ...overrides,
  };
}

describe('Feature: Cash shift open and close (US-027)', () => {
  let app: INestApplication;
  let staff: LifecycleClient;
  let owner: LifecycleClient;

  beforeEach(async () => {
    app = await createApiApp({ demoMode: true, nodeEnv: 'test' });
    staff = await new LifecycleClient(app).login();
    owner = await new LifecycleClient(app).login('owner', 'OwnerDemo!2026');
  });

  afterEach(async () => app.close());

  it('tracks the cash that crosses the counter during the shift and freezes the close', async () => {
    const empty = await staff.get('/api/cash-shifts/current').expect(200);
    expect(empty.body).toEqual({ expectation: null, shift: null });

    const opened = await staff.post('/api/cash-shifts', { openingFloatVnd: 500_000 }).expect(201);
    expect(opened.body).toMatchObject({
      closedAt: null,
      openedById: 'demo-staff',
      openedByName: 'Nhân viên',
      openingFloatVnd: 500_000,
      status: 'OPEN',
    });
    const again = await owner.post('/api/cash-shifts', { openingFloatVnd: 0 }).expect(409);
    expect(again.body.error.code).toBe('CASH_SHIFT_ALREADY_OPEN');
    await staff.post('/api/cash-shifts', { openingFloatVnd: -1 }).expect(400);

    const created = await staff.createActiveContract(['vehicle-001'], PAST_INTERVAL, {
      depositVnd: 300_000,
    });
    const pay = (body: object) => staff.post(`/api/contracts/${created.id}/payments`, body);
    await pay(payment({ amountVnd: 150_000 })).expect(201);
    await pay(payment({ amountVnd: 30_000, kind: 'REFUND' })).expect(201);
    await pay(payment({ amountVnd: 20_000, method: 'BANK_TRANSFER' })).expect(201);
    await staff.post('/api/expenses', expense()).expect(201);
    await staff.post('/api/expenses', expense({ method: 'BANK_TRANSFER' })).expect(201);
    const [lineId] = await staff.openLineIds(created.id);
    await staff
      .post(`/api/contracts/${created.id}/lines/${lineId}/return`, RETURN_INPUT)
      .expect(201);
    await staff.post(`/api/contracts/${created.id}/settle`).expect(201);
    await staff
      .post(`/api/contracts/${created.id}/deposit-refund`, {
        idempotencyKey: crypto.randomUUID(),
        method: 'CASH',
      })
      .expect(201);

    const current = await staff.get('/api/cash-shifts/current').expect(200);
    // Net paid 120 000 of 150 000 → 10 000 of the deposit is applied, 290 000 goes back.
    expect(current.body.expectation).toMatchObject({
      cashCollectedVnd: 150_000,
      cashExpensesVnd: 40_000,
      cashRefundedVnd: 30_000,
      depositRefundedVnd: 290_000,
      expectedCashVnd: 290_000,
      openingFloatVnd: 500_000,
    });

    const shiftId = opened.body.id as string;
    const noNote = await staff
      .post(`/api/cash-shifts/${shiftId}/close`, { countedCashVnd: 280_000 })
      .expect(400);
    expect(noNote.body.error.code).toBe('CASH_SHIFT_NOTE_REQUIRED');
    const closed = await staff
      .post(`/api/cash-shifts/${shiftId}/close`, { countedCashVnd: 280_000, note: 'Thiếu tiền lẻ' })
      .expect(200);
    expect(closed.body).toMatchObject({
      closedById: 'demo-staff',
      closedByName: 'Nhân viên',
      countedCashVnd: 280_000,
      expectedCashVnd: 290_000,
      note: 'Thiếu tiền lẻ',
      status: 'CLOSED',
      varianceVnd: -10_000,
    });
    const twice = await staff
      .post(`/api/cash-shifts/${shiftId}/close`, { countedCashVnd: 1, note: 'x' })
      .expect(409);
    expect(twice.body.error.code).toBe('CASH_SHIFT_NOT_OPEN');
    await staff.get('/api/cash-shifts/current').expect(200, { expectation: null, shift: null });
    expect(await app.get(AuditService).list()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ action: 'CASH_SHIFT_OPENED', entityId: shiftId }),
        expect.objectContaining({
          action: 'CASH_SHIFT_CLOSED',
          entityId: shiftId,
          metadata: { countedCashVnd: 280_000, expectedCashVnd: 290_000, varianceVnd: -10_000 },
        }),
      ]),
    );
  });

  it('limits closing to the opener or the Owner and scopes the history by role (BR-08)', async () => {
    const ownerShift = await owner.post('/api/cash-shifts', { openingFloatVnd: 0 }).expect(201);
    const forbidden = await staff
      .post(`/api/cash-shifts/${ownerShift.body.id}/close`, { countedCashVnd: 0 })
      .expect(403);
    expect(forbidden.body.error.code).toBe('FORBIDDEN');
    await owner
      .post(`/api/cash-shifts/${ownerShift.body.id}/close`, { countedCashVnd: 0 })
      .expect(200);

    const staffShift = await staff
      .post('/api/cash-shifts', { openingFloatVnd: 100_000 })
      .expect(201);
    await owner
      .post(`/api/cash-shifts/${staffShift.body.id}/close`, { countedCashVnd: 100_000 })
      .expect(200);
    await staff.post('/api/cash-shifts/missing/close', { countedCashVnd: 0 }).expect(404);
    await staff.agent.post('/api/cash-shifts').send({ openingFloatVnd: 0 }).expect(403);

    const mine = await staff.get('/api/cash-shifts').expect(200);
    expect(mine.body.items.map((item: { id: string }) => item.id)).toEqual([staffShift.body.id]);
    expect(mine.body.items[0]).toMatchObject({ closedByName: 'Chủ cửa hàng', varianceVnd: 0 });
    const all = await owner.get('/api/cash-shifts').expect(200);
    expect(all.body.items.map((item: { id: string }) => item.id)).toEqual([
      staffShift.body.id,
      ownerShift.body.id,
    ]);
  });
});
