import type { INestApplication } from '@nestjs/common';
import type { IncomingMessage } from 'node:http';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApiApp } from '../../apps/api/src/main';
import { readZipEntries } from '../domain/support/xlsx-reader';
import { LifecycleClient, type Interval } from './support/lifecycle-client';

/** Four days at the 3–6 day tier (130 000 ₫/day) = 520 000 ₫. */
const FOUR_DAYS: Interval = {
  endAt: '2026-09-05T08:00:00.000Z',
  startAt: '2026-09-01T08:00:00.000Z',
};
const ACQUISITION = {
  purchasePriceVnd: 30_000_000,
  purchasedOn: '2026-01-15',
  salvageValueVnd: 3_000_000,
  usefulLifeMonths: 36,
};
const AS_OF = 'asOf=2026-09-18';

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

function binaryParser(
  response: IncomingMessage,
  callback: (error: Error | null, body: Buffer) => void,
) {
  const chunks: Buffer[] = [];
  response.on('data', (chunk: Buffer) => chunks.push(chunk));
  response.on('end', () => callback(null, Buffer.concat(chunks)));
}

describe('Feature: Fleet economics report and workbook (US-025, BR-08)', () => {
  let app: INestApplication;
  let staff: LifecycleClient;
  let owner: LifecycleClient;

  beforeEach(async () => {
    app = await createApiApp({ demoMode: true, nodeEnv: 'test' });
    staff = await new LifecycleClient(app).login();
    owner = await new LifecycleClient(app).login('owner', 'OwnerDemo!2026');
  });

  afterEach(async () => app.close());

  describe('Scenario: The fleet economics report reconciles vehicles, expenses and depreciation', () => {
    async function seedFleet() {
      await owner.agent
        .put('/api/fleet/vehicles/vehicle-001/acquisition')
        .set('x-csrf-token', owner.csrf)
        .send(ACQUISITION)
        .expect(200);
      const contract = await staff.post('/api/contracts', {
        confirmed: true,
        customerId: 'demo-customer',
        deliveryFeeVnd: 30_000,
        ...FOUR_DAYS,
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
        vehicleIds: ['vehicle-001'],
      });
      expect(contract.status).toBe(201);
      const id = contract.body.id as string;
      await staff.post(`/api/contracts/${id}/activate`).expect(201);
      const [lineId] = await staff.openLineIds(id);
      await staff
        .post(`/api/contracts/${id}/charges`, {
          amountVnd: 40_000,
          description: 'Phụ phí trả trễ',
          kind: 'OTHER',
          lineId,
        })
        .expect(201);
      await staff.post('/api/expenses', expenseBody()).expect(201);
      await staff
        .post(
          '/api/expenses',
          expenseBody({
            amountVnd: 5_000_000,
            category: 'RENT',
            description: 'Thuê mặt bằng',
            vehicleId: null,
          }),
        )
        .expect(201);
    }

    it('computes the golden row, the unallocated buckets and keeps Staff out (BR-08)', async () => {
      await seedFleet();
      const report = await owner.get(`/api/reports/fleet-economics?${AS_OF}`).expect(200);
      expect(report.body).toMatchObject({ asOf: '2026-09-18', timeZone: 'Asia/Ho_Chi_Minh' });
      const rows = report.body.rows as { code: string }[];
      expect(rows.map((row) => row.code)).toEqual(['XE-001', 'XE-002', 'XE-003']);
      expect(rows[0]).toMatchObject({
        accumulatedDepreciationVnd: 6_000_000,
        bookValueVnd: 24_000_000,
        breakEven: { status: 'PROJECTED' },
        expensesVnd: 250_000,
        monthlyDepreciationVnd: 750_000,
        netVnd: 310_000,
        purchasePriceVnd: 30_000_000,
        recoveredPercent: 1,
        rentalDays: 4,
        revenueVnd: 560_000,
      });
      expect(rows[1]).toMatchObject({ bookValueVnd: 0, breakEven: { status: 'NO_COST' } });
      expect(report.body.totals).toMatchObject({
        expensesVnd: 5_250_000,
        netVnd: -4_660_000,
        revenueVnd: 590_000,
        unallocatedExpensesVnd: 5_000_000,
        unallocatedRevenueVnd: 30_000,
        vehicleCount: 3,
        vehiclesRecovered: 0,
      });
      const today = await owner.get('/api/reports/fleet-economics').expect(200);
      expect(today.body.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
      await owner.get('/api/reports/fleet-economics?asOf=18-09-2026').expect(400);
      const denied = await staff.get(`/api/reports/fleet-economics?${AS_OF}`).expect(403);
      expect(denied.body.error.code).toBe('FORBIDDEN');
      await staff.get(`/api/reports/fleet-economics/export?${AS_OF}`).expect(403);
    });

    it('exports one row per vehicle plus the unallocated and total rows', async () => {
      await seedFleet();
      const response = await owner.agent
        .get(`/api/reports/fleet-economics/export?${AS_OF}`)
        .buffer(true)
        .parse(binaryParser)
        .expect(200);
      expect(response.headers['content-disposition']).toContain('hieu-qua-doi-xe-2026-09-18.xlsx');
      const entries = readZipEntries(response.body as Buffer);
      const sheet = entries.get('xl/worksheets/sheet1.xml') ?? '';
      expect(entries.get('xl/workbook.xml')).toContain('Đội xe');
      expect(sheet).toContain('<t xml:space="preserve">XE-001</t>');
      expect(sheet).toContain('<t xml:space="preserve">Chưa phân bổ</t>');
      expect(sheet).toContain('<t xml:space="preserve">Tổng cộng</t>');
      expect(sheet).toContain('Dự kiến');
      expect(sheet).toContain('<v>30000000</v>');
      expect(sheet).toContain('<v>24000000</v>');
      expect(sheet).toContain('<v>-4660000</v>');
    });
  });
});
