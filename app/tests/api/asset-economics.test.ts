import type { INestApplication } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApiApp } from '../../apps/api/src/main';
import { LifecycleClient } from './support/lifecycle-client';

const ACQUISITION = {
  purchasePriceVnd: 30_000_000,
  purchasedOn: '2026-01-15',
  salvageValueVnd: 3_000_000,
  usefulLifeMonths: 36,
};

function expenseBody(overrides: object = {}) {
  return {
    amountVnd: 250_000,
    category: 'MAINTENANCE',
    description: 'Thay nhớt',
    idempotencyKey: crypto.randomUUID(),
    method: 'CASH',
    paidOn: '2026-09-10',
    vehicleId: 'vehicle-001',
    ...overrides,
  };
}

describe('Feature: Vehicle cost, depreciation, expenses and break-even (US-023..025)', () => {
  let app: INestApplication;
  let staff: LifecycleClient;
  let owner: LifecycleClient;

  beforeEach(async () => {
    app = await createApiApp({ demoMode: true, nodeEnv: 'test' });
    staff = await new LifecycleClient(app).login();
    owner = await new LifecycleClient(app).login('owner', 'OwnerDemo!2026');
  });

  afterEach(async () => app.close());

  const auditEvents = async (action: string) => {
    const response = await owner.get(`/api/audit?action=${action}`).expect(200);
    return response.body.items as { metadata: Record<string, unknown> }[];
  };

  describe('Scenario: The Owner records a vehicle acquisition and the change is audited', () => {
    it('stores, exposes and audits the acquisition; Staff and unknown vehicles are refused', async () => {
      const set = await owner.agent
        .put('/api/fleet/vehicles/vehicle-001/acquisition')
        .set('x-csrf-token', owner.csrf)
        .send(ACQUISITION)
        .expect(200);
      expect(set.body).toMatchObject({
        ...ACQUISITION,
        updatedById: 'demo-owner',
        vehicleId: 'vehicle-001',
      });
      const view = await staff.get('/api/fleet/vehicles/vehicle-001/acquisition').expect(200);
      expect(view.body.acquisition).toMatchObject(ACQUISITION);
      const empty = await staff.get('/api/fleet/vehicles/vehicle-002/acquisition').expect(200);
      expect(empty.body).toEqual({ acquisition: null, vehicleId: 'vehicle-002' });

      await owner.agent
        .put('/api/fleet/vehicles/vehicle-001/acquisition')
        .set('x-csrf-token', owner.csrf)
        .send({ ...ACQUISITION, purchasePriceVnd: 32_000_000 })
        .expect(200);
      const events = await auditEvents('VEHICLE_ACQUISITION_SET');
      expect(events.map((event) => event.metadata)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            afterPriceVnd: 30_000_000,
            beforePriceVnd: 0,
            vehicleCode: 'XE-001',
          }),
          expect.objectContaining({ afterPriceVnd: 32_000_000, beforePriceVnd: 30_000_000 }),
        ]),
      );

      await staff.agent
        .put('/api/fleet/vehicles/vehicle-001/acquisition')
        .set('x-csrf-token', staff.csrf)
        .send(ACQUISITION)
        .expect(403);
      await owner.agent
        .put('/api/fleet/vehicles/no-such-vehicle/acquisition')
        .set('x-csrf-token', owner.csrf)
        .send(ACQUISITION)
        .expect(404);
      await owner.agent
        .put('/api/fleet/vehicles/vehicle-001/acquisition')
        .set('x-csrf-token', owner.csrf)
        .send({ ...ACQUISITION, salvageValueVnd: 40_000_000 })
        .expect(400);
    });
  });

  describe('Scenario: Staff records a vehicle expense and the ledger keeps who, when and how', () => {
    it('answers 201 with the recorder name and vehicle code, lists with totals and audits', async () => {
      const created = await staff.post('/api/expenses', expenseBody()).expect(201);
      expect(created.body).toMatchObject({
        amountVnd: 250_000,
        category: 'MAINTENANCE',
        recordedById: 'demo-staff',
        recordedByName: 'Nhân viên',
        reversalOfId: null,
        reversedByExpenseId: null,
        vehicleCode: 'XE-001',
      });
      expect(created.body).not.toHaveProperty('idempotencyKey');
      const list = await owner.get('/api/expenses').expect(200);
      expect(list.body).toMatchObject({
        count: 1,
        totals: {
          byCategory: [{ category: 'MAINTENANCE', netVnd: 250_000 }],
          cashVnd: 250_000,
          netVnd: 250_000,
          reversedVnd: 0,
          transferVnd: 0,
        },
      });
      const events = await auditEvents('EXPENSE_RECORDED');
      expect(events[0]?.metadata).toMatchObject({
        amountVnd: 250_000,
        category: 'MAINTENANCE',
        vehicleCode: 'XE-001',
      });
    });
  });

  describe('Scenario: Replaying an expense with the same idempotency key does not double-record', () => {
    it('returns the stored row on replay and 409 on a different amount', async () => {
      const body = expenseBody();
      const first = await staff.post('/api/expenses', body).expect(201);
      const replay = await staff.post('/api/expenses', body).expect(201);
      expect(replay.body.id).toBe(first.body.id);
      const list = await staff.get('/api/expenses').expect(200);
      expect(list.body.count).toBe(1);
      const conflict = await staff.post('/api/expenses', { ...body, amountVnd: 1 }).expect(409);
      expect(conflict.body.error.code).toBe('CONFLICT');
    });
  });

  describe('Scenario: Expense input is validated', () => {
    it('rejects zero amounts, unknown vehicles and unknown categories', async () => {
      await staff.post('/api/expenses', expenseBody({ amountVnd: 0 })).expect(400);
      await staff.post('/api/expenses', expenseBody({ vehicleId: 'no-such-vehicle' })).expect(404);
      await staff.post('/api/expenses', expenseBody({ category: 'BRIBE' })).expect(400);
      await staff.get('/api/expenses?from=2026-13-01').expect(400);
      await staff.get('/api/expenses?limit=501').expect(400);
    });
  });

  describe('Scenario: The Owner corrects an expense with a reversal entry, never an edit', () => {
    it('writes a mirror row, links both, nets to zero and enforces the reversal rules', async () => {
      const original = await staff.post('/api/expenses', expenseBody()).expect(201);
      const id = original.body.id as string;
      const reversed = await owner
        .post(`/api/expenses/${id}/reversal`, { reason: 'Nhập nhầm xe' })
        .expect(201);
      expect(reversed.body).toMatchObject({
        amountVnd: 250_000,
        description: 'Đảo: Nhập nhầm xe',
        recordedByName: 'Chủ cửa hàng',
        reversalOfId: id,
        vehicleCode: 'XE-001',
      });
      const list = await staff.get('/api/expenses').expect(200);
      expect(list.body.count).toBe(2);
      expect(list.body.items.find((item: { id: string }) => item.id === id)).toMatchObject({
        reversedByExpenseId: reversed.body.id,
      });
      expect(list.body.totals).toMatchObject({ netVnd: 0, reversedVnd: 250_000 });
      const events = await auditEvents('EXPENSE_REVERSED');
      expect(events[0]?.metadata).toMatchObject({ amountVnd: 250_000, reason: 'Nhập nhầm xe' });

      await owner.post(`/api/expenses/${id}/reversal`, { reason: 'Lần hai' }).expect(409);
      await owner
        .post(`/api/expenses/${reversed.body.id as string}/reversal`, {
          reason: 'Đảo bút toán đảo',
        })
        .expect(409);
      await owner
        .post('/api/expenses/no-such-expense/reversal', { reason: 'Không có' })
        .expect(404);
      await staff.post(`/api/expenses/${id}/reversal`, { reason: 'Nhân viên' }).expect(403);
      await owner.agent.patch(`/api/expenses/${id}`).set('x-csrf-token', owner.csrf).expect(404);
      await owner.agent.delete(`/api/expenses/${id}`).set('x-csrf-token', owner.csrf).expect(404);
    });
  });

  describe('Scenario: The expense list filters by paid day, category and vehicle', () => {
    it('filters and orders newest paid day first', async () => {
      await staff
        .post(
          '/api/expenses',
          expenseBody({ category: 'FUEL', paidOn: '2026-09-01', vehicleId: null }),
        )
        .expect(201);
      await staff.post('/api/expenses', expenseBody()).expect(201);
      await staff
        .post(
          '/api/expenses',
          expenseBody({ category: 'INSURANCE', paidOn: '2026-09-12', vehicleId: 'vehicle-002' }),
        )
        .expect(201);
      const ranged = await staff.get('/api/expenses?from=2026-09-05&to=2026-09-12').expect(200);
      expect(ranged.body.items.map((item: { paidOn: string }) => item.paidOn)).toEqual([
        '2026-09-12',
        '2026-09-10',
      ]);
      const byVehicle = await staff.get('/api/expenses?vehicleId=vehicle-001').expect(200);
      expect(byVehicle.body.items).toHaveLength(1);
      expect(byVehicle.body.items[0].category).toBe('MAINTENANCE');
      const byCategory = await staff.get('/api/expenses?category=FUEL').expect(200);
      expect(byCategory.body.items).toHaveLength(1);
      expect(byCategory.body.items[0].vehicleCode).toBeNull();
      const limited = await staff.get('/api/expenses?limit=1').expect(200);
      expect(limited.body.count).toBe(1);
    });
  });
});
