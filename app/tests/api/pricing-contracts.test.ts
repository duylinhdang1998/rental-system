import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { INestApplication } from '@nestjs/common';
import { AuditService } from '../../apps/api/src/common/audit/audit.service';
import { createApiApp } from '../../apps/api/src/main';
import { csrfFrom } from './support/csrf';

const INTERVAL = {
  endAt: '2026-10-06T08:00:00.000Z',
  startAt: '2026-10-01T08:00:00.000Z',
};

function pricingContractInput(vehicleIds = ['vehicle-001']) {
  return {
    confirmed: true,
    customerId: 'demo-customer',
    deliveryFeeVnd: 50_000,
    ...INTERVAL,
    handover: {
      deliveryPlace: 'Cửa hàng',
      depositVnd: 1_000_000,
      fuelPercent: 75,
      imageObjectKeys: ['private/handovers/demo/image-1.jpg'],
      notes: 'Synthetic handover',
      retainedDocument: 'CCCD ••••1234',
    },
    idempotencyKey: crypto.randomUUID(),
    overrides: [],
    vehicleIds,
  };
}

describe('Feature: Pricing and multi-vehicle contract APIs', () => {
  let app: INestApplication;
  let staff: ReturnType<typeof request.agent>;
  let staffCsrf: string;

  beforeEach(async () => {
    app = await createApiApp({ nodeEnv: 'test', demoMode: true });
    staff = request.agent(app.getHttpServer());
    const login = await staff
      .post('/api/auth/login')
      .send({ password: 'StaffDemo!2026', username: 'staff' })
      .expect(201);
    staffCsrf = csrfFrom(login);
  });

  afterEach(async () => app.close());

  it('quotes versioned tiers and applies the synthetic VIP adjustment', async () => {
    const quote = await staff
      .post('/api/pricing/quote')
      .set('x-csrf-token', staffCsrf)
      .send({
        customerId: 'demo-vip',
        deliveryFeeVnd: 0,
        ...INTERVAL,
        overrides: [],
        vehicleIds: ['vehicle-001'],
      })
      .expect(201);
    expect(quote.body.lines[0]).toMatchObject({
      adjustmentPercent: 10,
      baseSubtotalVnd: 650_000,
      finalSubtotalVnd: 585_000,
      pricingVersionNumber: 1,
    });
  });

  it('publishes contiguous pricing versions while old contract snapshots stay unchanged', async () => {
    const before = await staff
      .post('/api/contracts')
      .set('x-csrf-token', staffCsrf)
      .send(pricingContractInput())
      .expect(201);
    const owner = request.agent(app.getHttpServer());
    const login = await owner
      .post('/api/auth/login')
      .send({ password: 'OwnerDemo!2026', username: 'owner' })
      .expect(201);
    const csrf = csrfFrom(login);
    await owner
      .post('/api/pricing/versions')
      .set('x-csrf-token', csrf)
      .send({
        lateReturnPolicy: { graceMinutes: 90, hourlyRateVnd: 30_000 },
        typeCode: 'SCOOTER',
        tiers: [
          { dailyRateVnd: 140_000, maxDays: 2, minDays: 1 },
          { dailyRateVnd: 120_000, maxDays: null, minDays: 3 },
        ],
      })
      .expect(201);
    const current = await owner.get('/api/pricing/current?typeCode=SCOOTER').expect(200);
    expect(current.body.version).toBe(2);
    expect(current.body.lateReturnPolicy).toEqual({ graceMinutes: 90, hourlyRateVnd: 30_000 });
    const stored = await staff.get(`/api/contracts/${before.body.id}`).expect(200);
    expect(stored.body.quote.lines[0].lateReturnPolicy).toEqual({
      graceMinutes: 60,
      hourlyRateVnd: 20_000,
    });
    expect(stored.body.quote.lines[0]).toMatchObject({
      dailyRateVnd: 130_000,
      pricingVersionNumber: 1,
    });
    const next = await owner
      .post('/api/pricing/quote')
      .set('x-csrf-token', csrf)
      .send({
        customerId: 'demo-customer',
        deliveryFeeVnd: 0,
        ...INTERVAL,
        overrides: [],
        vehicleIds: ['vehicle-002'],
      })
      .expect(201);
    expect(next.body.lines[0]).toMatchObject({ dailyRateVnd: 120_000, pricingVersionNumber: 2 });
    expect(next.body.lines[0].lateReturnPolicy).toEqual({
      graceMinutes: 90,
      hourlyRateVnd: 30_000,
    });
    await owner
      .post('/api/pricing/versions')
      .set('x-csrf-token', csrf)
      .send({ typeCode: 'SCOOTER', tiers: [{ dailyRateVnd: 100_000, maxDays: 2, minDays: 2 }] })
      .expect(400);
  });

  it('requires Owner and a reason for a manual price override', async () => {
    const withoutReason = {
      customerId: 'demo-customer',
      deliveryFeeVnd: 0,
      ...INTERVAL,
      overrides: [{ amountVnd: 600_000, vehicleId: 'vehicle-001' }],
      vehicleIds: ['vehicle-001'],
    };
    await staff
      .post('/api/pricing/quote')
      .set('x-csrf-token', staffCsrf)
      .send(withoutReason)
      .expect(400);
    await staff
      .post('/api/pricing/quote')
      .set('x-csrf-token', staffCsrf)
      .send({
        ...withoutReason,
        overrides: [{ ...withoutReason.overrides[0], reason: 'Negotiated rate' }],
      })
      .expect(403);

    const owner = request.agent(app.getHttpServer());
    const login = await owner
      .post('/api/auth/login')
      .send({ password: 'OwnerDemo!2026', username: 'owner' })
      .expect(201);
    const quote = await owner
      .post('/api/pricing/quote')
      .set('x-csrf-token', csrfFrom(login))
      .send({
        ...withoutReason,
        overrides: [{ ...withoutReason.overrides[0], reason: 'Negotiated rate' }],
      })
      .expect(201);
    expect(quote.body.lines[0]).toMatchObject({
      baseSubtotalVnd: 650_000,
      finalSubtotalVnd: 600_000,
    });
    expect(await app.get(AuditService).list()).toContainEqual(
      expect.objectContaining({
        action: 'PRICE_OVERRIDDEN',
        metadata: expect.objectContaining({ reason: 'Negotiated rate' }),
      }),
    );
  });

  it('keeps adjacent intervals available and reports overlapping conflicts', async () => {
    const created = await staff
      .post('/api/contracts')
      .set('x-csrf-token', staffCsrf)
      .send(pricingContractInput())
      .expect(201);
    expect(created.body.code).toMatch(/^HD-\d{4}-/);

    const adjacent = await staff
      .post('/api/contracts/availability')
      .set('x-csrf-token', staffCsrf)
      .send({
        endAt: '2026-10-07T08:00:00.000Z',
        startAt: INTERVAL.endAt,
        vehicleIds: ['vehicle-001'],
      })
      .expect(201);
    expect(adjacent.body).toEqual({ available: true, conflicts: [] });

    const overlap = await staff
      .post('/api/contracts/availability')
      .set('x-csrf-token', staffCsrf)
      .send({ ...INTERVAL, vehicleIds: ['vehicle-001'] })
      .expect(201);
    expect(overlap.body).toMatchObject({
      available: false,
      conflicts: [{ vehicleId: 'vehicle-001' }],
    });
  });

  it('has exactly one winner for concurrent overlapping contract creation', async () => {
    const outcomes = await Promise.all(
      [pricingContractInput(), pricingContractInput()].map((input) =>
        staff.post('/api/contracts').set('x-csrf-token', staffCsrf).send(input),
      ),
    );
    expect(outcomes.map((result) => result.status).sort()).toEqual([201, 409]);
  });

  it('rejects a conflicting multi-vehicle contract without reserving its other vehicle', async () => {
    await staff
      .post('/api/contracts')
      .set('x-csrf-token', staffCsrf)
      .send(pricingContractInput(['vehicle-002']))
      .expect(201);
    await staff
      .post('/api/contracts')
      .set('x-csrf-token', staffCsrf)
      .send(pricingContractInput(['vehicle-001', 'vehicle-002']))
      .expect(409);
    const available = await staff
      .post('/api/contracts/availability')
      .set('x-csrf-token', staffCsrf)
      .send({ ...INTERVAL, vehicleIds: ['vehicle-001'] })
      .expect(201);
    expect(available.body.available).toBe(true);
  });

  it('creates an immutable snapshot and exports an authenticated PDF', async () => {
    const input = pricingContractInput(['vehicle-001', 'vehicle-002']);
    const created = await staff
      .post('/api/contracts')
      .set('x-csrf-token', staffCsrf)
      .send(input)
      .expect(201);
    expect(created.body).toMatchObject({
      handover: { imageCount: 1 },
      quote: {
        totalVnd: 1_350_000,
      },
      status: 'CONFIRMED',
    });
    expect(created.body.quote.lines[0].lateReturnPolicy).toEqual({
      graceMinutes: 60,
      hourlyRateVnd: 20_000,
    });
    expect(JSON.stringify(created.body)).not.toContain('imageObjectKeys');
    const calendar = await staff
      .get('/api/fleet/calendar?from=2026-10-01&to=2026-10-02&typeCode=SCOOTER')
      .expect(200);
    expect(
      calendar.body.vehicles.find((vehicle: { id: string }) => vehicle.id === 'vehicle-001')
        .periods[0].state,
    ).toBe('HELD');
    const repeated = await staff
      .post('/api/contracts')
      .set('x-csrf-token', staffCsrf)
      .send(input)
      .expect(201);
    expect(repeated.body.id).toBe(created.body.id);

    const pdf = await staff.get(`/api/contracts/${created.body.id}/pdf`).buffer().expect(200);
    expect(pdf.headers['content-type']).toMatch(/application\/pdf/);
    expect(pdf.body.subarray(0, 4).toString()).toBe('%PDF');
    await request(app.getHttpServer()).get(`/api/contracts/${created.body.id}/pdf`).expect(401);
  });

  it('protects private handover keys and returns only access descriptors', async () => {
    const invalid = pricingContractInput();
    invalid.handover.imageObjectKeys = ['public/leaked.jpg'];
    await staff.post('/api/contracts').set('x-csrf-token', staffCsrf).send(invalid).expect(400);
    await staff.get('/api/contracts/missing').expect(404);
    const created = await staff
      .post('/api/contracts')
      .set('x-csrf-token', staffCsrf)
      .send(pricingContractInput())
      .expect(201);
    const access = await staff.get(`/api/contracts/${created.body.id}/handover-images`).expect(200);
    expect(access.body.items[0]).toMatchObject({ expiresInSeconds: 300, label: 'Ảnh bàn giao 1' });
    expect(JSON.stringify(access.body)).not.toContain('private/handovers');
  });
});
