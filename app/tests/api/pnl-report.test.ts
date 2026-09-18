import type { INestApplication } from '@nestjs/common';
import type { IncomingMessage } from 'node:http';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApiApp } from '../../apps/api/src/main';
import { readZipEntries } from '../domain/support/xlsx-reader';
import { LifecycleClient, contractInput, type Interval } from './support/lifecycle-client';

const GOLDEN: Interval = {
  endAt: '2026-09-05T08:00:00.000Z',
  startAt: '2026-09-01T08:00:00.000Z',
};
const ACQUISITION = {
  purchasePriceVnd: 30_000_000,
  purchasedOn: '2026-01-15',
  salvageValueVnd: 3_000_000,
  usefulLifeMonths: 36,
};
const MONTHLY_DEPRECIATION = 750_000;
const QUERY = 'to=2026-09&months=12';

function expenseBody(amountVnd: number, paidOn: string) {
  return {
    amountVnd,
    category: 'MAINTENANCE',
    description: 'Bảo dưỡng định kỳ',
    idempotencyKey: crypto.randomUUID(),
    method: 'CASH',
    paidOn,
    vehicleId: 'vehicle-001',
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

describe('Feature: Monthly profit and loss (US-029, BR-08)', () => {
  let app: INestApplication;
  let staff: LifecycleClient;
  let owner: LifecycleClient;

  beforeEach(async () => {
    app = await createApiApp({ demoMode: true, nodeEnv: 'test' });
    staff = await new LifecycleClient(app).login();
    owner = await new LifecycleClient(app).login('owner', 'OwnerDemo!2026');
  });

  afterEach(async () => app.close());

  async function seedBooks() {
    const body = { ...contractInput(['vehicle-001'], GOLDEN), deliveryFeeVnd: 30_000 };
    const created = await staff.post('/api/contracts', body).expect(201);
    const id = created.body.id as string;
    await staff.post(`/api/contracts/${id}/activate`).expect(201);
    const [lineId] = await staff.openLineIds(id);
    await staff
      .post(`/api/contracts/${id}/charges`, {
        amountVnd: 40_000,
        description: 'Phụ phí khác',
        kind: 'OTHER',
        lineId,
      })
      .expect(201);
    await owner
      .post(`/api/contracts/${id}/charges`, {
        amountVnd: 20_000,
        description: 'Khách quen',
        kind: 'DISCOUNT',
      })
      .expect(201);
    await owner.agent
      .put('/api/fleet/vehicles/vehicle-001/acquisition')
      .set('x-csrf-token', owner.csrf)
      .send(ACQUISITION)
      .expect(200);
    await staff.post('/api/expenses', expenseBody(250_000, '2026-09-10')).expect(201);
    await staff.post('/api/expenses', expenseBody(5_000_000, '2026-08-01')).expect(201);
  }

  it('answers the Owner with twelve month rows ending September and their totals', async () => {
    await seedBooks();
    const response = await owner.get(`/api/reports/pnl?${QUERY}`).expect(200);
    expect(response.body).toMatchObject({
      from: '2025-10',
      timeZone: 'Asia/Ho_Chi_Minh',
      to: '2026-09',
    });
    const months = response.body.months as { month: string }[];
    expect(months).toHaveLength(12);
    expect(months[0]?.month).toBe('2025-10');
    expect(months.at(-1)).toEqual({
      depreciationVnd: MONTHLY_DEPRECIATION,
      expensesVnd: 250_000,
      month: '2026-09',
      profitVnd: -430_000,
      revenueVnd: 570_000,
    });
    expect(months.at(-2)).toEqual({
      depreciationVnd: MONTHLY_DEPRECIATION,
      expensesVnd: 5_000_000,
      month: '2026-08',
      profitVnd: -5_750_000,
      revenueVnd: 0,
    });
    expect(months[0]).toMatchObject({ depreciationVnd: 0, profitVnd: 0 });
    expect(response.body.totals).toEqual({
      depreciationVnd: 8 * MONTHLY_DEPRECIATION,
      expensesVnd: 5_250_000,
      profitVnd: 570_000 - 5_250_000 - 8 * MONTHLY_DEPRECIATION,
      revenueVnd: 570_000,
    });
  });

  it('defaults to the twelve months ending the current business month and validates the query', async () => {
    const response = await owner.get('/api/reports/pnl').expect(200);
    expect(response.body.months).toHaveLength(12);
    expect(response.body.to).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/u);
    expect(response.body.months.at(-1).month).toBe(response.body.to);
    const six = await owner.get('/api/reports/pnl?months=6&to=2026-03').expect(200);
    expect(six.body).toMatchObject({ from: '2025-10', to: '2026-03' });
    expect(six.body.months).toHaveLength(6);
    await owner.get('/api/reports/pnl?months=0').expect(400);
    await owner.get('/api/reports/pnl?months=25').expect(400);
    await owner.get('/api/reports/pnl?to=2026-13').expect(400);
    await owner.get('/api/reports/pnl/export?to=2026-9').expect(400);
  });

  it('keeps the profit and loss Owner-only (BR-08)', async () => {
    const denied = await staff.get(`/api/reports/pnl?${QUERY}`).expect(403);
    expect(denied.body.error.code).toBe('FORBIDDEN');
    await staff.get(`/api/reports/pnl/export?${QUERY}`).expect(403);
  });

  it('exports the month table with a totals row', async () => {
    await seedBooks();
    const response = await owner
      .get(`/api/reports/pnl/export?${QUERY}`)
      .buffer(true)
      .parse(binaryParser)
      .expect(200);
    expect(response.headers['content-type']).toContain('spreadsheetml.sheet');
    expect(response.headers['content-disposition']).toBe(
      'attachment; filename="lai-lo-2025-10-2026-09.xlsx"',
    );
    const entries = readZipEntries(response.body as Buffer);
    expect(entries.get('xl/workbook.xml')).toContain('name="Lãi lỗ"');
    const sheet = entries.get('xl/worksheets/sheet1.xml') ?? '';
    expect(sheet).toContain('<t xml:space="preserve">Khấu hao</t>');
    expect(sheet).toContain('<t xml:space="preserve">2026-09</t>');
    expect(sheet).toContain('<v>-430000</v>');
    expect(sheet).toContain('<t xml:space="preserve">Tổng cộng</t>');
  });
});
