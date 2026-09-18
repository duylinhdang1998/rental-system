import type { INestApplication } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApiApp } from '../../apps/api/src/main';
import { LifecycleClient, PAST_INTERVAL } from './support/lifecycle-client';

const LAN = { name: 'Nguyễn Thị Lan', password: 'MatKhau!2026x', username: 'nv.lan' };
const OCTOBER = { endAt: '2026-10-06T08:00:00.000Z', startAt: '2026-10-01T08:00:00.000Z' };

describe('Feature: Employee account management (US-006)', () => {
  let app: INestApplication;
  let owner: LifecycleClient;
  let staff: LifecycleClient;

  beforeEach(async () => {
    app = await createApiApp({ demoMode: true, nodeEnv: 'test' });
    owner = await new LifecycleClient(app).login('owner', 'OwnerDemo!2026');
    staff = await new LifecycleClient(app).login();
  });

  afterEach(async () => app.close());

  async function createLan() {
    const response = await owner.post('/api/employees', LAN).expect(201);
    return response.body as { id: string };
  }

  describe('Scenario: Only the Owner manages employees', () => {
    it('rejects every employee and audit call from Staff with 403', async () => {
      await staff.get('/api/employees').expect(403);
      await staff.post('/api/employees', LAN).expect(403);
      await staff.agent
        .patch('/api/employees/demo-owner/status')
        .set('x-csrf-token', staff.csrf)
        .send({ active: false })
        .expect(403);
      await staff
        .post('/api/employees/demo-owner/password', { password: LAN.password })
        .expect(403);
      await staff.get('/api/audit').expect(403);
    });
  });

  describe('Scenario: Owner creates a Staff account', () => {
    it('creates an active Staff account that can sign in, audits it and refuses duplicates', async () => {
      const created = await owner.post('/api/employees', LAN).expect(201);
      expect(created.body).toMatchObject({ active: true, role: 'STAFF', username: 'nv.lan' });
      expect(JSON.stringify(created.body)).not.toMatch(/password|hash/i);

      const list = await owner.get('/api/employees').expect(200);
      expect(list.body.count).toBe(3);
      expect(list.body.items.map((item: { username: string }) => item.username)).toContain(
        'nv.lan',
      );

      const audit = await owner.get('/api/audit?entityType=Account').expect(200);
      expect(audit.body.items[0]).toMatchObject({
        action: 'EMPLOYEE_CREATED',
        actorName: 'Chủ cửa hàng',
        entityType: 'Account',
        metadata: { role: 'STAFF', username: 'nv.lan' },
      });

      await new LifecycleClient(app).login(LAN.username, LAN.password);
      await owner.post('/api/employees', LAN).expect(409);
      await owner.post('/api/employees', { ...LAN, username: 'nv' }).expect(400);
      await owner
        .post('/api/employees', { ...LAN, password: 'short', username: 'nv.hai' })
        .expect(400);
    });
  });

  describe('Scenario: Locking an employee ends their sessions but keeps their history', () => {
    it('invalidates the session, blocks sign-in and keeps the actor name on history', async () => {
      const { id } = await createLan();
      const lan = await new LifecycleClient(app).login(LAN.username, LAN.password);
      const contract = await lan.createActiveContract(['vehicle-001'], PAST_INTERVAL);
      await lan
        .post(`/api/contracts/${contract.id}/payments`, {
          amountVnd: 50_000,
          idempotencyKey: crypto.randomUUID(),
          method: 'CASH',
        })
        .expect(201);

      const locked = await owner.agent
        .patch(`/api/employees/${id}/status`)
        .set('x-csrf-token', owner.csrf)
        .send({ active: false })
        .expect(200);
      expect(locked.body.active).toBe(false);
      await lan.get('/api/auth/session').expect(401);
      const login = await lan.agent
        .post('/api/auth/login')
        .send({ password: LAN.password, username: LAN.username })
        .expect(401);
      expect(login.body.message).toBe('Tài khoản hiện không thể truy cập');

      const ledger = await owner.get(`/api/contracts/${contract.id}/ledger`).expect(200);
      expect(JSON.stringify(ledger.body)).toContain('Nguyễn Thị Lan');
      const audit = await owner.get('/api/audit?limit=5').expect(200);
      expect(audit.body.items[0]).toMatchObject({
        action: 'EMPLOYEE_LOCKED',
        metadata: { username: 'nv.lan' },
      });
      expect(
        audit.body.items.some((item: { actorName: string }) => item.actorName === 'Nguyễn Thị Lan'),
      ).toBe(true);
    });
  });

  describe('Scenario: Owner unlocks an employee', () => {
    it('lets the employee sign in again and audits the unlock', async () => {
      const { id } = await createLan();
      const status = (active: boolean) =>
        owner.agent
          .patch(`/api/employees/${id}/status`)
          .set('x-csrf-token', owner.csrf)
          .send({ active });
      await status(false).expect(200);
      await status(true).expect(200);
      await new LifecycleClient(app).login(LAN.username, LAN.password);
      const audit = await owner.get('/api/audit?action=EMPLOYEE_UNLOCKED').expect(200);
      expect(audit.body.count).toBe(1);
    });
  });

  describe('Scenario: Owner resets an employee password', () => {
    it('ends the current session, rejects the old password and accepts the new one', async () => {
      const { id } = await createLan();
      const lan = await new LifecycleClient(app).login(LAN.username, LAN.password);
      await owner
        .post(`/api/employees/${id}/password`, { password: 'MatKhauMoi!2026' })
        .expect(201);
      await lan.get('/api/auth/session').expect(401);
      await lan.agent
        .post('/api/auth/login')
        .send({ password: LAN.password, username: LAN.username })
        .expect(401);
      await new LifecycleClient(app).login(LAN.username, 'MatKhauMoi!2026');
      const audit = await owner.get('/api/audit?action=EMPLOYEE_PASSWORD_RESET').expect(200);
      expect(audit.body.items[0]).toMatchObject({ entityId: id });
      expect(JSON.stringify(audit.body)).not.toContain('MatKhauMoi');
      await owner
        .post('/api/employees/missing/password', { password: 'MatKhauMoi!2026' })
        .expect(404);
    });
  });

  describe('Scenario: The Owner cannot lock their own account', () => {
    it('answers 409 and keeps the Owner active', async () => {
      const response = await owner.agent
        .patch('/api/employees/demo-owner/status')
        .set('x-csrf-token', owner.csrf)
        .send({ active: false })
        .expect(409);
      expect(response.body.message).toContain('tự khóa');
      const list = await owner.get('/api/employees').expect(200);
      expect(list.body.items.find((item: { id: string }) => item.id === 'demo-owner').active).toBe(
        true,
      );
    });
  });
});

describe('Feature: Owner audit log (US-020)', () => {
  let app: INestApplication;
  let owner: LifecycleClient;

  beforeEach(async () => {
    app = await createApiApp({ demoMode: true, nodeEnv: 'test' });
    owner = await new LifecycleClient(app).login('owner', 'OwnerDemo!2026');
  });

  afterEach(async () => app.close());

  it('shows actor, time, reason, old and new price for an override, newest first and paged', async () => {
    await owner
      .post('/api/pricing/quote', {
        customerId: 'demo-customer',
        deliveryFeeVnd: 0,
        ...OCTOBER,
        overrides: [{ amountVnd: 600_000, reason: 'Khách quen', vehicleId: 'vehicle-001' }],
        vehicleIds: ['vehicle-001'],
      })
      .expect(201);
    await owner.createContract(['vehicle-002']);

    const overrides = await owner.get('/api/audit?entityType=VehicleQuote').expect(200);
    expect(overrides.body.items[0]).toMatchObject({
      action: 'PRICE_OVERRIDDEN',
      actorName: 'Chủ cửa hàng',
      metadata: { after: 600_000, before: 650_000, reason: 'Khách quen' },
    });
    expect(overrides.body.items[0].at).toMatch(/^\d{4}-\d{2}-\d{2}T/);

    const latest = await owner.get('/api/audit?limit=1').expect(200);
    expect(latest.body.count).toBe(1);
    expect(latest.body.items[0].action).toBe('CONTRACT_CREATED');
    const all = await owner.get('/api/audit').expect(200);
    const times = all.body.items.map((item: { at: string }) => item.at);
    expect([...times].sort().reverse()).toEqual(times);
    await owner.get('/api/audit?limit=500').expect(400);
    await owner.get('/api/audit?from=2026-13-01').expect(400);
  });
});
