import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApiApp } from '../../apps/api/src/main';

function csrfFrom(response: request.Response): string {
  const value = response.headers['set-cookie']
    ?.find((cookie: string) => cookie.startsWith('rental_csrf='))
    ?.split(';')[0]
    ?.split('=')[1];
  if (!value) throw new Error('Expected CSRF cookie');
  return value;
}

function contractInput() {
  return {
    confirmed: true,
    customerId: 'demo-customer',
    deliveryFeeVnd: 0,
    endAt: '2026-10-06T08:00:00.000Z',
    handover: {
      deliveryPlace: 'Cửa hàng',
      depositVnd: 0,
      fuelPercent: 75,
      imageObjectKeys: [],
      notes: '',
      retainedDocument: '',
    },
    idempotencyKey: crypto.randomUUID(),
    overrides: [],
    startAt: '2026-10-01T08:00:00.000Z',
    vehicleIds: ['vehicle-001'],
  };
}

describe('Feature: Configurable late-return pricing', () => {
  let app: INestApplication;
  let staff: ReturnType<typeof request.agent>;
  let csrf: string;

  beforeEach(async () => {
    app = await createApiApp({ demoMode: true, nodeEnv: 'test' });
    staff = request.agent(app.getHttpServer());
    const login = await staff
      .post('/api/auth/login')
      .send({ password: 'StaffDemo!2026', username: 'staff' })
      .expect(201);
    csrf = csrfFrom(login);
  });

  afterEach(async () => app.close());

  it('prevents Staff from changing the late-return configuration', async () => {
    await staff
      .post('/api/pricing/versions')
      .set('x-csrf-token', csrf)
      .send({
        lateReturnPolicy: { graceMinutes: 90, hourlyRateVnd: 30_000 },
        tiers: [{ dailyRateVnd: 150_000, maxDays: null, minDays: 1 }],
        typeCode: 'SCOOTER',
      })
      .expect(403);
  });

  it('calculates fees from the immutable policy of the returned vehicle', async () => {
    const created = await staff
      .post('/api/contracts')
      .set('x-csrf-token', csrf)
      .send(contractInput())
      .expect(201);
    const calculate = (actualReturnAt: string) =>
      staff
        .post(`/api/contracts/${created.body.id}/late-return-fee`)
        .set('x-csrf-token', csrf)
        .send({ actualReturnAt, vehicleId: 'vehicle-001' });
    const free = await calculate('2026-10-06T09:00:00.000Z').expect(201);
    expect(free.body).toMatchObject({ billableLateHours: 0, feeVnd: 0, lateMinutes: 60 });
    const charged = await calculate('2026-10-06T10:01:00.000Z').expect(201);
    expect(charged.body).toMatchObject({
      billableLateHours: 2,
      feeVnd: 40_000,
      hourlyRateVnd: 20_000,
      lateMinutes: 121,
    });
  });
});
