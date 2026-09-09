import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AuditService } from '../../apps/api/src/common/audit/audit.service';
import { createApiApp } from '../../apps/api/src/main';
import { ContractBoardService } from '../../apps/api/src/modules/contracts/contract-board.service';
import { ContractLifecycleService } from '../../apps/api/src/modules/contracts/contract-lifecycle.service';
import { LifecycleClient, OCTOBER_INTERVAL, PAST_INTERVAL } from './support/lifecycle-client';

describe('Feature: Contract lifecycle and daily operations', () => {
  let app: INestApplication;
  let staff: LifecycleClient;

  beforeEach(async () => {
    app = await createApiApp({ demoMode: true, nodeEnv: 'test' });
    staff = await new LifecycleClient(app).login();
  });

  afterEach(async () => app.close());

  it('moves a reservation into renting and rents its vehicle with history and audit', async () => {
    const created = await staff.createContract(['vehicle-001']);
    expect(await staff.vehicle('vehicle-001')).toMatchObject({ status: 'RESERVED' });
    const activated = await staff.post(`/api/contracts/${created.id}/activate`).expect(201);
    expect(activated.body).toMatchObject({ status: 'ACTIVE' });
    expect(activated.body.activatedAt).toEqual(expect.any(String));
    expect(activated.body.events.map((event: { type: string }) => event.type)).toEqual([
      'CREATED',
      'ACTIVATED',
    ]);
    expect(await staff.vehicle('vehicle-001')).toMatchObject({ status: 'RENTED' });
    const history = await staff.get('/api/fleet/vehicles/vehicle-001/history').expect(200);
    expect(history.body.at(-1)).toMatchObject({ reason: `Hợp đồng ${created.code}`, to: 'RENTED' });
    expect(await app.get(AuditService).list()).toContainEqual(
      expect.objectContaining({ action: 'CONTRACT_ACTIVATED', entityId: created.id }),
    );
  });

  it('rejects forbidden transitions with 409 and leaves everything unchanged', async () => {
    const created = await staff.createActiveContract(['vehicle-001']);
    const cancelled = await staff
      .post(`/api/contracts/${created.id}/cancel`, { reason: 'Khách đổi lịch' })
      .expect(409);
    expect(cancelled.body.error.code).toBe('INVALID_TRANSITION');
    await staff.post(`/api/contracts/${created.id}/activate`).expect(409);
    await staff.post(`/api/contracts/${created.id}/complete`).expect(201);
    await staff.post(`/api/contracts/${created.id}/cancel`, { reason: 'Quá muộn' }).expect(409);
    const stored = await staff.get(`/api/contracts/${created.id}`).expect(200);
    expect(stored.body.status).toBe('COMPLETED');
    expect(stored.body.events.map((event: { type: string }) => event.type)).toEqual([
      'CREATED',
      'ACTIVATED',
      'COMPLETED',
    ]);
    expect(await staff.vehicle('vehicle-001')).toMatchObject({ status: 'AVAILABLE' });
  });

  it('marks overdue contracts exactly once from the scheduled end instant', async () => {
    const created = await staff.createActiveContract(['vehicle-001']);
    const lifecycle = app.get(ContractLifecycleService);
    const before = await lifecycle.evaluateOverdue(new Date('2026-10-06T07:59:00.000Z'));
    expect(before.markedContractCodes).toEqual([]);
    const at = await lifecycle.evaluateOverdue(new Date('2026-10-06T08:00:00.000Z'));
    expect(at.markedContractCodes).toEqual([created.code]);
    const again = await lifecycle.evaluateOverdue(new Date('2026-10-06T09:00:00.000Z'));
    expect(again.markedContractCodes).toEqual([]);
    const stored = await staff.get(`/api/contracts/${created.id}`).expect(200);
    expect(stored.body).toMatchObject({
      overdueSince: OCTOBER_INTERVAL.endAt,
      status: 'OVERDUE',
    });
    const overdueEvents = stored.body.events.filter(
      (event: { type: string }) => event.type === 'OVERDUE',
    );
    expect(overdueEvents).toHaveLength(1);
    expect(overdueEvents[0]).toMatchObject({ actorId: 'system' });
    const audits = await app.get(AuditService).list();
    expect(audits.filter((event) => event.action === 'CONTRACT_OVERDUE')).toHaveLength(1);
    expect(await staff.vehicle('vehicle-001')).toMatchObject({ status: 'RENTED' });
  });

  it('exposes the evaluation endpoint and the board reports hours late', async () => {
    const created = await staff.createActiveContract(['vehicle-001'], PAST_INTERVAL);
    const evaluation = await staff.post('/api/contracts/lifecycle/evaluate').expect(201);
    expect(evaluation.body.markedContractCodes).toContain(created.code);
    const board = await staff.get('/api/contracts/board').expect(200);
    expect(board.body.items[0]).toMatchObject({
      code: created.code,
      kind: 'OVERDUE',
      status: 'OVERDUE',
      vehicleCodes: ['XE-001'],
    });
    expect(board.body.items[0].hoursLate).toBeGreaterThan(0);
    expect(board.body).toMatchObject({ overdue: 1, timeZone: 'Asia/Ho_Chi_Minh' });
    expect(board.body.maxOverdueHours).toBe(board.body.items[0].hoursLate);
  });

  it('cancels with actor and reason, keeps the record and frees the vehicle', async () => {
    const created = await staff.createContract(['vehicle-001']);
    await staff.post(`/api/contracts/${created.id}/cancel`, {}).expect(400);
    await staff.post(`/api/contracts/${created.id}/cancel`, { reason: 'ab' }).expect(400);
    const cancelled = await staff
      .post(`/api/contracts/${created.id}/cancel`, { reason: 'Khách đổi lịch' })
      .expect(201);
    expect(cancelled.body).toMatchObject({
      cancellationReason: 'Khách đổi lịch',
      status: 'CANCELLED',
    });
    expect(cancelled.body.cancelledById).toEqual(expect.any(String));
    expect(cancelled.body.cancelledAt).toEqual(expect.any(String));
    expect(await staff.vehicle('vehicle-001')).toMatchObject({ status: 'AVAILABLE' });
    const availability = await staff
      .post('/api/contracts/availability', { ...OCTOBER_INTERVAL, vehicleIds: ['vehicle-001'] })
      .expect(201);
    expect(availability.body).toEqual({ available: true, conflicts: [] });
    const list = await staff.get('/api/contracts?status=CANCELLED').expect(200);
    expect(list.body.items).toContainEqual(
      expect.objectContaining({
        code: created.code,
        status: 'CANCELLED',
        vehicleCodes: ['XE-001'],
      }),
    );
    expect(await app.get(AuditService).list()).toContainEqual(
      expect.objectContaining({
        action: 'CONTRACT_CANCELLED',
        metadata: { reason: 'Khách đổi lịch' },
      }),
    );
  });

  it('rejects an extension whose extra range conflicts and changes nothing', async () => {
    const first = await staff.createActiveContract(['vehicle-001']);
    const second = await staff.createContract(['vehicle-001'], {
      endAt: '2026-10-09T08:00:00.000Z',
      startAt: '2026-10-07T08:00:00.000Z',
    });
    const conflict = await staff
      .post(`/api/contracts/${first.id}/extend`, { newEndAt: '2026-10-08T08:00:00.000Z' })
      .expect(409);
    expect(conflict.body.message).toContain('XE-001');
    expect(conflict.body.message).toContain(second.code);
    const stored = await staff.get(`/api/contracts/${first.id}`).expect(200);
    expect(stored.body.quote).toMatchObject({ endAt: OCTOBER_INTERVAL.endAt, totalVnd: 650_000 });
    expect(stored.body.events.some((event: { type: string }) => event.type === 'EXTENDED')).toBe(
      false,
    );
    await staff
      .post(`/api/contracts/${first.id}/extend`, { newEndAt: '2026-10-05T08:00:00.000Z' })
      .expect(400);
  });

  it('reprices the whole period by the final tier from the snapshot version', async () => {
    const created = await staff.createActiveContract(['vehicle-001']);
    const owner = await new LifecycleClient(app).login('owner', 'OwnerDemo!2026');
    await owner
      .post('/api/pricing/versions', {
        tiers: [{ dailyRateVnd: 500_000, maxDays: null, minDays: 1 }],
        typeCode: 'SCOOTER',
      })
      .expect(201);
    const extended = await staff
      .post(`/api/contracts/${created.id}/extend`, {
        newEndAt: '2026-10-08T08:00:00.000Z',
        reason: 'Khách ở thêm',
      })
      .expect(201);
    expect(extended.body.quote).toMatchObject({
      endAt: '2026-10-08T08:00:00.000Z',
      totalVnd: 700_000,
    });
    expect(extended.body.quote.lines[0]).toMatchObject({
      billableDays: 7,
      dailyRateVnd: 100_000,
      endAt: '2026-10-08T08:00:00.000Z',
      finalSubtotalVnd: 700_000,
      pricingVersionNumber: 1,
    });
    expect(extended.body.events.at(-1)).toMatchObject({
      metadata: {
        newEndAt: '2026-10-08T08:00:00.000Z',
        newTotalVnd: 700_000,
        previousEndAt: OCTOBER_INTERVAL.endAt,
        previousTotalVnd: 650_000,
      },
      reason: 'Khách ở thêm',
      type: 'EXTENDED',
    });
    expect(await app.get(AuditService).list()).toContainEqual(
      expect.objectContaining({
        action: 'CONTRACT_EXTENDED',
        metadata: expect.objectContaining({ newTotalVnd: 700_000, previousTotalVnd: 650_000 }),
      }),
    );
  });

  it('rejects a swap when the replacement is unavailable or booked', async () => {
    const created = await staff.createActiveContract(['vehicle-001']);
    const stored = await staff.get(`/api/contracts/${created.id}`).expect(200);
    const lineId = stored.body.quote.lines[0].id;
    await staff.createContract(['vehicle-003']);
    await staff
      .post(`/api/contracts/${created.id}/swap`, {
        lineId,
        reason: 'Xe hỏng đèn',
        replacementVehicleId: 'vehicle-002',
      })
      .expect(409);
    await staff
      .post(`/api/contracts/${created.id}/swap`, {
        lineId,
        reason: 'Xe hỏng đèn',
        replacementVehicleId: 'vehicle-003',
      })
      .expect(409);
    await staff
      .post(`/api/contracts/${created.id}/swap`, {
        lineId,
        reason: 'Xe hỏng đèn',
        replacementVehicleId: 'vehicle-001',
      })
      .expect(400);
    const unchanged = await staff.get(`/api/contracts/${created.id}`).expect(200);
    expect(unchanged.body.quote.lines).toHaveLength(1);
  });

  it('swaps a vehicle by closing the old line and linking the replacement', async () => {
    const created = await staff.createActiveContract(['vehicle-001'], {
      endAt: '2027-01-01T08:00:00.000Z',
      startAt: '2026-09-01T08:00:00.000Z',
    });
    const stored = await staff.get(`/api/contracts/${created.id}`).expect(200);
    const lineId = stored.body.quote.lines[0].id;
    const swapped = await staff
      .post(`/api/contracts/${created.id}/swap`, {
        lineId,
        reason: 'Xe hỏng đèn',
        replacementVehicleId: 'vehicle-003',
      })
      .expect(201);
    const [old, replacement] = swapped.body.quote.lines;
    expect(old).toMatchObject({ replacedByLineId: replacement.id, vehicleCode: 'XE-001' });
    expect(replacement).toMatchObject({
      endAt: '2027-01-01T08:00:00.000Z',
      finalSubtotalVnd: old.finalSubtotalVnd,
      replacedByLineId: null,
      replacesLineId: old.id,
      startAt: old.endAt,
      vehicleCode: 'XE-003',
    });
    expect(Date.parse(old.endAt)).toBeGreaterThan(Date.parse(old.startAt));
    expect(swapped.body.quote).toMatchObject({
      startAt: '2026-09-01T08:00:00.000Z',
      totalVnd: stored.body.quote.totalVnd,
    });
    expect(swapped.body.events.at(-1)).toMatchObject({
      metadata: { fromVehicleCode: 'XE-001', toVehicleCode: 'XE-003' },
      reason: 'Xe hỏng đèn',
      type: 'SWAPPED',
    });
    expect(await staff.vehicle('vehicle-001')).toMatchObject({ status: 'AVAILABLE' });
    expect(await staff.vehicle('vehicle-003')).toMatchObject({ status: 'RENTED' });
    const pdf = await staff.get(`/api/contracts/${created.id}/pdf`).buffer().expect(200);
    expect(pdf.body.subarray(0, 4).toString()).toBe('%PDF');
  });

  it('lists contracts by status and search and builds the board in business time', async () => {
    const active = await staff.createActiveContract(['vehicle-001'], {
      endAt: '2026-10-06T16:30:00.000Z',
      startAt: '2026-10-05T16:30:00.000Z',
    });
    const overdue = await staff.createActiveContract(['vehicle-002'], {
      endAt: '2026-10-06T02:00:00.000Z',
      startAt: '2026-10-05T02:00:00.000Z',
    });
    const tomorrow = await staff.createContract(['vehicle-003'], {
      endAt: '2026-10-09T17:30:00.000Z',
      startAt: '2026-10-06T17:30:00.000Z',
    });
    const cancelled = await staff.createContract(['vehicle-001'], PAST_INTERVAL);
    await staff.post(`/api/contracts/${cancelled.id}/cancel`, { reason: 'Khách hủy' }).expect(201);
    const activeList = await staff.get('/api/contracts?status=ACTIVE').expect(200);
    expect(activeList.body.items.map((item: { code: string }) => item.code).sort()).toEqual(
      [active.code, overdue.code].sort(),
    );
    const search = await staff.get(`/api/contracts?search=${tomorrow.code}`).expect(200);
    expect(search.body.items).toHaveLength(1);
    expect(search.body.items[0]).toMatchObject({ code: tomorrow.code, status: 'CONFIRMED' });
    const all = await staff.get('/api/contracts').expect(200);
    expect(all.body.items).toHaveLength(4);
    const board = await app.get(ContractBoardService).board(new Date('2026-10-06T08:00:00.000Z'));
    expect(board.items.map((item) => [item.code, item.kind, item.hoursLate])).toEqual([
      [overdue.code, 'OVERDUE', 6],
      [active.code, 'DUE_TODAY', 0],
    ]);
    expect(board).toMatchObject({ activeRentals: 2, dueToday: 1, overdue: 1 });
  });

  it('requires authentication and CSRF for lifecycle actions', async () => {
    const created = await staff.createContract(['vehicle-001']);
    await request(app.getHttpServer()).post(`/api/contracts/${created.id}/activate`).expect(401);
    await staff.agent.post(`/api/contracts/${created.id}/activate`).expect(403);
    await request(app.getHttpServer()).get('/api/contracts/board').expect(401);
    await staff.post('/api/contracts/missing/activate').expect(404);
  });
});
