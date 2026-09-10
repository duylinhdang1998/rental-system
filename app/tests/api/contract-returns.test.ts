import type { INestApplication } from '@nestjs/common';
import { returnQueueSchema } from '@rental/contracts';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AuditService } from '../../apps/api/src/common/audit/audit.service';
import { createApiApp } from '../../apps/api/src/main';
import { LifecycleClient, PAST_INTERVAL } from './support/lifecycle-client';

const RETURN_INPUT = { actualReturnAt: PAST_INTERVAL.endAt, condition: 'GOOD', fuelPercent: 60 };

describe('Feature: Return and settlement — receiving vehicles', () => {
  let app: INestApplication;
  let staff: LifecycleClient;

  beforeEach(async () => {
    app = await createApiApp({ demoMode: true, nodeEnv: 'test' });
    staff = await new LifecycleClient(app).login();
  });

  afterEach(async () => app.close());

  function returnLine(contractId: string, lineId: string, input: object = RETURN_INPUT) {
    return staff.post(`/api/contracts/${contractId}/lines/${lineId}/return`, input);
  }

  it('receives vehicles one at a time; the last one completes the contract (BR-03)', async () => {
    const created = await staff.createActiveContract(['vehicle-001', 'vehicle-002'], PAST_INTERVAL);
    const [first, second] = await staff.openLineIds(created.id);
    const partial = await returnLine(created.id, first!, { ...RETURN_INPUT, notes: 'Xe sạch' });
    expect(partial.status).toBe(201);
    expect(partial.body).toMatchObject({ completedAt: null, status: 'ACTIVE' });
    expect(partial.body.quote.lines[0].inspection).toEqual({
      actualReturnAt: PAST_INTERVAL.endAt,
      condition: 'GOOD',
      fuelPercent: 60,
      imageCount: 0,
      lateFeeVnd: 0,
      notes: 'Xe sạch',
      returnedById: expect.any(String),
    });
    expect(partial.body.quote.lines[1].inspection).toBeNull();
    expect(partial.body.events.at(-1)).toMatchObject({
      metadata: expect.objectContaining({ completed: false, vehicleCode: 'XE-001' }),
      reason: 'Xe sạch',
      type: 'LINE_RETURNED',
    });
    expect(await staff.vehicle('vehicle-001')).toMatchObject({ status: 'AVAILABLE' });

    const statement = await staff.get(`/api/contracts/${created.id}/settlement`).expect(200);
    expect(statement.body).toMatchObject({ openVehicleCodes: ['XE-002'], ready: false });
    const blocked = await staff.post(`/api/contracts/${created.id}/settle`).expect(409);
    expect(blocked.body.message).toContain('XE-002');

    const completed = await returnLine(created.id, second!).expect(201);
    expect(completed.body).toMatchObject({ completedAt: PAST_INTERVAL.endAt, status: 'COMPLETED' });
    expect(completed.body.events.map((event: { type: string }) => event.type)).toEqual([
      'CREATED',
      'ACTIVATED',
      'LINE_RETURNED',
      'LINE_RETURNED',
      'COMPLETED',
    ]);
    expect(await staff.openLineIds(created.id)).toEqual([]);
    const audit = await app.get(AuditService).list();
    expect(audit.filter((entry) => entry.action === 'CONTRACT_VEHICLE_RETURNED')).toHaveLength(2);
    expect(audit).toContainEqual(
      expect.objectContaining({ action: 'CONTRACT_COMPLETED', entityId: created.id }),
    );
  });

  it.each([
    ['2026-09-02T07:00:00.000Z', 0, 0],
    ['2026-09-02T09:01:00.000Z', 20_000, 1],
    ['2026-09-02T10:30:00.000Z', 40_000, 2],
    ['2026-09-03T08:00:00.000Z', 460_000, 23],
  ])('charges the late fee for a return at %s: %i VND', async (actualReturnAt, fee, hours) => {
    const created = await staff.createActiveContract(['vehicle-001'], PAST_INTERVAL);
    const [lineId] = await staff.openLineIds(created.id);
    const returned = await returnLine(created.id, lineId!, { ...RETURN_INPUT, actualReturnAt });
    expect(returned.status).toBe(201);
    expect(returned.body.quote.lines[0].inspection).toMatchObject({
      actualReturnAt,
      lateFeeVnd: fee,
    });
    expect(returned.body.charges).toHaveLength(fee ? 1 : 0);
    if (fee) {
      expect(returned.body.charges[0]).toMatchObject({
        amountVnd: fee,
        description: expect.stringContaining(`${hours} giờ tính phí`),
        kind: 'LATE_RETURN',
        vehicleCode: 'XE-001',
      });
    }
    const statement = await staff.get(`/api/contracts/${created.id}/settlement`).expect(200);
    expect(statement.body).toMatchObject({ chargesVnd: 150_000 + fee, ready: true });
  });

  it.each([
    ['MAINTENANCE', 'MAINTENANCE'],
    ['DAMAGED', 'DAMAGED'],
  ])(
    'parks a vehicle returned as %s outside the rental flow (BR-02)',
    async (condition, status) => {
      const created = await staff.createActiveContract(['vehicle-001'], PAST_INTERVAL);
      const [lineId] = await staff.openLineIds(created.id);
      await returnLine(created.id, lineId!, { ...RETURN_INPUT, condition }).expect(201);
      expect(await staff.vehicle('vehicle-001')).toMatchObject({ status });
      const history = await staff.get('/api/fleet/vehicles/vehicle-001/history').expect(200);
      expect(history.body.at(-1)).toMatchObject({ reason: `Hợp đồng ${created.code}`, to: status });
    },
  );

  it('validates the return moment, the private image store and the line state', async () => {
    const created = await staff.createActiveContract(['vehicle-001', 'vehicle-002'], PAST_INTERVAL);
    const [lineId] = await staff.openLineIds(created.id);
    await returnLine(created.id, lineId!, { ...RETURN_INPUT, fuelPercent: 150 }).expect(400);
    const early = await returnLine(created.id, lineId!, {
      ...RETURN_INPUT,
      actualReturnAt: '2026-08-31T08:00:00.000Z',
    }).expect(400);
    expect(early.body.error.code).toBe('INVALID_INPUT');
    await returnLine(created.id, lineId!, {
      ...RETURN_INPUT,
      actualReturnAt: '2099-01-01T00:00:00.000Z',
    }).expect(400);
    await returnLine(created.id, lineId!, {
      ...RETURN_INPUT,
      imageObjectKeys: ['public/returns/a.jpg'],
    }).expect(400);
    await returnLine(created.id, 'missing-line').expect(404);
    const reserved = await staff.createContract(['vehicle-003']);
    const [reservedLine] = await staff.openLineIds(reserved.id);
    const notRenting = await returnLine(reserved.id, reservedLine!).expect(409);
    expect(notRenting.body.error.code).toBe('INVALID_TRANSITION');

    const returned = await returnLine(created.id, lineId!, {
      ...RETURN_INPUT,
      imageObjectKeys: ['private/returns/a.jpg', 'private/returns/b.jpg'],
    }).expect(201);
    expect(returned.body.quote.lines[0].inspection).toMatchObject({ imageCount: 2 });
    expect(JSON.stringify(returned.body)).not.toContain('private/returns');
    const twice = await returnLine(created.id, lineId!).expect(404);
    expect(twice.body.error.code).toBe('NOT_FOUND');
  });

  it('keeps returned lines out of an extension and reprices only the open ones', async () => {
    const created = await staff.createActiveContract(['vehicle-001', 'vehicle-002'], PAST_INTERVAL);
    const [first] = await staff.openLineIds(created.id);
    await returnLine(created.id, first!).expect(201);
    const extended = await staff
      .post(`/api/contracts/${created.id}/extend`, { newEndAt: '2026-09-03T08:00:00.000Z' })
      .expect(201);
    expect(extended.body.quote).toMatchObject({
      endAt: '2026-09-03T08:00:00.000Z',
      totalVnd: 450_000,
    });
    expect(extended.body.quote.lines[0]).toMatchObject({
      endAt: PAST_INTERVAL.endAt,
      finalSubtotalVnd: 150_000,
    });
    expect(extended.body.quote.lines[1]).toMatchObject({
      billableDays: 2,
      endAt: '2026-09-03T08:00:00.000Z',
      finalSubtotalVnd: 300_000,
    });
    const [second] = await staff.openLineIds(created.id);
    await returnLine(created.id, second!, {
      ...RETURN_INPUT,
      actualReturnAt: '2026-09-03T08:00:00.000Z',
    }).expect(201);
    const statement = await staff.get(`/api/contracts/${created.id}/settlement`).expect(200);
    expect(statement.body).toMatchObject({ chargesVnd: 450_000, ready: true });
  });

  it('lists the vehicles still out, most urgent first, with per-line late policies', async () => {
    const created = await staff.createActiveContract(['vehicle-001', 'vehicle-002'], PAST_INTERVAL);
    const [first] = await staff.openLineIds(created.id);
    await returnLine(created.id, first!).expect(201);
    const response = await staff.get('/api/contracts/returns/queue').expect(200);
    const queue = returnQueueSchema.parse(response.body);
    expect(queue.timeZone).toBe('Asia/Ho_Chi_Minh');
    expect(queue).toMatchObject({ dueToday: 0, overdue: 1, renting: 1 });
    expect(queue.items[0]).toMatchObject({
      code: created.code,
      kind: 'OVERDUE',
      returnedCount: 1,
      vehicleCount: 2,
    });
    expect(queue.items[0]?.hoursLate).toBeGreaterThan(0);
    expect(queue.items[0]?.lines).toEqual([
      expect.objectContaining({
        endAt: PAST_INTERVAL.endAt,
        kind: 'OVERDUE',
        lateReturnPolicy: { graceMinutes: 60, hourlyRateVnd: 20_000 },
        vehicleCode: 'XE-002',
        vehicleId: 'vehicle-002',
      }),
    ]);
    const settled = await staff.createContract(['vehicle-003']);
    expect(queue.items.some((item) => item.code === settled.code)).toBe(false);
  });

  it('requires a session for the queue and a CSRF token for returns', async () => {
    await request(app.getHttpServer()).get('/api/contracts/returns/queue').expect(401);
    const created = await staff.createActiveContract(['vehicle-001'], PAST_INTERVAL);
    const [lineId] = await staff.openLineIds(created.id);
    await staff.agent
      .post(`/api/contracts/${created.id}/lines/${lineId}/return`)
      .send(RETURN_INPUT)
      .expect(403);
  });
});
