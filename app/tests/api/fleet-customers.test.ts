import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { INestApplication } from '@nestjs/common';
import { createApiApp } from '../../apps/api/src/main';
import { AuditService } from '../../apps/api/src/common/audit/audit.service';
import { csrfFrom } from './support/csrf';

describe('Feature: Fleet, customer and catalog foundations — API', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createApiApp({ nodeEnv: 'test', demoMode: true });
  });

  afterEach(async () => {
    await app.close();
  });

  it('allows Owner catalog mutation and denies Staff', async () => {
    const owner = request.agent(app.getHttpServer());
    const ownerLogin = await owner
      .post('/api/auth/login')
      .send({ username: 'owner', password: 'OwnerDemo!2026' })
      .expect(201);
    const payload = { code: 'SCOOTER', name: 'Scooter' };
    const createdType = await owner
      .post('/api/fleet/types')
      .set('x-csrf-token', csrfFrom(ownerLogin))
      .send(payload)
      .expect(201);
    expect(createdType.body.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(await app.get(AuditService).list()).toContainEqual(
      expect.objectContaining({ action: 'VEHICLE_TYPE_CREATED', actorId: 'demo-owner' }),
    );

    const staff = request.agent(app.getHttpServer());
    const staffLogin = await staff
      .post('/api/auth/login')
      .send({ username: 'staff', password: 'StaffDemo!2026' })
      .expect(201);
    await staff
      .post('/api/fleet/types')
      .set('x-csrf-token', csrfFrom(staffLogin))
      .send(payload)
      .expect(403);
  });

  it('creates, finds and protects a normalized unique vehicle plate', async () => {
    const staff = request.agent(app.getHttpServer());
    const login = await staff
      .post('/api/auth/login')
      .send({ username: 'staff', password: 'StaffDemo!2026' })
      .expect(201);
    const csrf = csrfFrom(login);
    const vehicle = {
      code: 'TEST-099',
      color: 'Đỏ',
      model: 'Vision',
      plate: '43A1-099.99',
      typeCode: 'SCOOTER',
      year: 2025,
    };
    const createdVehicle = await staff
      .post('/api/fleet/vehicles')
      .set('x-csrf-token', csrf)
      .send(vehicle)
      .expect(201);
    expect(createdVehicle.body.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    const list = await staff.get('/api/fleet/vehicles?search=099.99&status=AVAILABLE').expect(200);
    expect(list.body.items).toContainEqual(
      expect.objectContaining({
        code: 'TEST-099',
        createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
        status: 'AVAILABLE',
      }),
    );

    const duplicate = await staff
      .post('/api/fleet/vehicles')
      .set('x-csrf-token', csrf)
      .send({ ...vehicle, code: 'TEST-100', plate: '43a1 099.99' })
      .expect(409);
    expect(duplicate.body.requestId).toMatch(/^req_/);
  });

  it('returns an accessible vehicle availability calendar', async () => {
    const staff = request.agent(app.getHttpServer());
    await staff
      .post('/api/auth/login')
      .send({ username: 'staff', password: 'StaffDemo!2026' })
      .expect(201);
    const response = await staff
      .get('/api/fleet/calendar?from=2026-09-01&to=2026-09-07&typeCode=SCOOTER')
      .expect(200);
    expect(response.body.days).toHaveLength(7);
    expect(response.body.vehicles[0].periods).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ state: expect.stringMatching(/AVAILABLE|HELD|RENTED/) }),
      ]),
    );
  });

  it('stores reasoned status history and rejects rental state without a contract', async () => {
    const staff = request.agent(app.getHttpServer());
    const login = await staff
      .post('/api/auth/login')
      .send({ username: 'staff', password: 'StaffDemo!2026' })
      .expect(201);
    const csrf = csrfFrom(login);
    const created = await staff
      .post('/api/fleet/vehicles')
      .set('x-csrf-token', csrf)
      .send({
        code: 'STATUS-1',
        color: 'Đen',
        model: 'Wave',
        plate: '43A1-077.77',
        typeCode: 'MANUAL',
        year: 2024,
      })
      .expect(201);
    await staff
      .patch(`/api/fleet/vehicles/${created.body.id}/status`)
      .set('x-csrf-token', csrf)
      .send({ reason: 'Scheduled service', status: 'MAINTENANCE' })
      .expect(200);
    const history = await staff.get(`/api/fleet/vehicles/${created.body.id}/history`).expect(200);
    expect(history.body).toContainEqual(
      expect.objectContaining({
        from: 'AVAILABLE',
        reason: 'Scheduled service',
        to: 'MAINTENANCE',
      }),
    );
    await staff
      .patch(`/api/fleet/vehicles/${created.body.id}/status`)
      .set('x-csrf-token', csrf)
      .send({ reason: 'No contract exists', status: 'RENTED' })
      .expect(409);
  });

  it('finds duplicate contacts and shows a redacted blacklist warning', async () => {
    const staff = request.agent(app.getHttpServer());
    const login = await staff
      .post('/api/auth/login')
      .send({ username: 'staff', password: 'StaffDemo!2026' })
      .expect(201);
    const csrf = csrfFrom(login);
    const customer = await staff
      .post('/api/customers')
      .set('x-csrf-token', csrf)
      .send({
        contacts: [{ primary: true, type: 'PHONE', value: '0900000099' }],
        name: 'Risk Fixture',
        nationality: 'VN',
        tags: [{ code: 'BLACKLIST', reason: 'Synthetic risk fixture' }],
      })
      .expect(201);
    expect(customer.body.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    const duplicates = await staff.get('/api/customers/duplicates?phone=0900000099').expect(200);
    expect(duplicates.body.items).toContainEqual(expect.objectContaining({ id: customer.body.id }));

    const search = await staff.get('/api/customers?search=Risk%20Fixture').expect(200);
    expect(search.body.items[0].warning).toEqual(
      expect.objectContaining({ reason: 'Synthetic risk fixture' }),
    );
    expect(JSON.stringify(search.body)).not.toMatch(/objectKey|documentImage/i);
  });

  it('keeps customer document access authenticated and redacted', async () => {
    await request(app.getHttpServer())
      .get('/api/customers/demo-risk/documents/demo-doc/access')
      .expect(401);
    const staff = request.agent(app.getHttpServer());
    await staff
      .post('/api/auth/login')
      .send({ username: 'staff', password: 'StaffDemo!2026' })
      .expect(201);
    const access = await staff
      .get('/api/customers/demo-risk/documents/demo-doc/access')
      .expect(200);
    expect(access.body).toMatchObject({ expiresInSeconds: 300 });
    expect(JSON.stringify(access.body)).not.toContain('objectKey');
  });

  it('rejects invalid customer PII without leaking internals', async () => {
    const staff = request.agent(app.getHttpServer());
    const login = await staff
      .post('/api/auth/login')
      .send({ username: 'staff', password: 'StaffDemo!2026' })
      .expect(201);
    const response = await staff
      .post('/api/customers')
      .set('x-csrf-token', csrfFrom(login))
      .send({
        contacts: [{ primary: true, type: 'EMAIL', value: 'not-an-email' }],
        name: 'Bad PII',
        nationality: 'VN',
        secret: 'must-not-echo',
      })
      .expect(400);
    expect(response.body.requestId).toMatch(/^req_/);
    expect(JSON.stringify(response.body)).not.toMatch(/must-not-echo|SQL|objectKey/i);
  });
});
