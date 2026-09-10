import type { INestApplication } from '@nestjs/common';
import type { IncomingMessage } from 'node:http';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApiApp } from '../../apps/api/src/main';
import { readZipEntries } from '../domain/support/xlsx-reader';
import { LifecycleClient, PAST_INTERVAL, type Interval } from './support/lifecycle-client';

/** Four days at the 3–6 day tier (130 000 ₫/day) = 520 000 ₫, enough for the golden ledger. */
const FOUR_DAYS: Interval = {
  endAt: '2026-09-02T08:00:00.000Z',
  startAt: '2026-08-29T08:00:00.000Z',
};
const RANGE = 'from=2026-09-10&to=2026-09-11';

function payment(amountVnd: number, method: string, receivedAt: string, extra: object = {}) {
  return { amountVnd, idempotencyKey: crypto.randomUUID(), method, receivedAt, ...extra };
}

function binaryParser(
  response: IncomingMessage,
  callback: (error: Error | null, body: Buffer) => void,
) {
  const chunks: Buffer[] = [];
  response.on('data', (chunk: Buffer) => chunks.push(chunk));
  response.on('end', () => callback(null, Buffer.concat(chunks)));
}

describe('Feature: Receivables and revenue reporting (FR-09, BR-08)', () => {
  let app: INestApplication;
  let staff: LifecycleClient;
  let owner: LifecycleClient;

  beforeEach(async () => {
    app = await createApiApp({ demoMode: true, nodeEnv: 'test' });
    staff = await new LifecycleClient(app).login();
    owner = await new LifecycleClient(app).login('owner', 'OwnerDemo!2026');
  });

  afterEach(async () => app.close());

  async function seedLedger() {
    const first = await staff.createActiveContract(['vehicle-001'], FOUR_DAYS, {
      depositVnd: 500_000,
      retainedDocument: 'CCCD 0000',
    });
    const second = await staff.createActiveContract(['vehicle-002'], PAST_INTERVAL);
    const pay = (id: string, body: object, client = staff) =>
      client.post(`/api/contracts/${id}/payments`, body).expect(201);
    await pay(
      first.id,
      payment(300_000, 'BANK_TRANSFER', '2026-09-09T17:30:00.000Z', { reference: 'FT123' }),
    );
    await pay(
      first.id,
      payment(100_000, 'CASH', '2026-09-10T03:00:00.000Z', { notes: 'Thu tại quầy' }),
    );
    await pay(first.id, payment(50_000, 'CASH', '2026-09-11T02:00:00.000Z', { kind: 'REFUND' }));
    await pay(second.id, payment(50_000, 'BANK_TRANSFER', '2026-09-11T02:00:00.000Z'), owner);
    await pay(second.id, payment(10_000, 'CASH', '2026-09-12T02:00:00.000Z'));
    return { first, second };
  }

  it('lists overdue money for Staff and Owner, oldest first, without revenue aggregates', async () => {
    const { first, second } = await seedLedger();
    await staff.createContract(['vehicle-003']);
    const response = await staff.get('/api/finance/receivables').expect(200);
    expect(response.body).toMatchObject({
      count: 2,
      overSevenDays: 2,
      timeZone: 'Asia/Ho_Chi_Minh',
      totalRemainingVnd: 260_000,
    });
    expect(response.body.items.map((item: { code: string }) => item.code)).toEqual([
      first.code,
      second.code,
    ]);
    expect(response.body.items[0]).toMatchObject({
      contractId: first.id,
      customerName: 'Khách hàng mẫu',
      dueAt: FOUR_DAYS.endAt,
      lastPaymentAt: '2026-09-11T02:00:00.000Z',
      paidVnd: 350_000,
      remainingVnd: 170_000,
      settledAt: null,
      status: expect.stringMatching(/^(ACTIVE|OVERDUE)$/u),
      totalDueVnd: 520_000,
    });
    expect(response.body.items[0].daysOutstanding).toBeGreaterThanOrEqual(8);
    expect(response.body.items[1]).toMatchObject({ paidVnd: 60_000, remainingVnd: 90_000 });
    expect(response.body).not.toHaveProperty('totals');
    const asOwner = await owner.get('/api/finance/receivables').expect(200);
    expect(asOwner.body.count).toBe(2);
  });

  it('keeps revenue aggregates Owner-only (BR-08)', async () => {
    const report = await staff.get(`/api/reports/revenue?${RANGE}`).expect(403);
    expect(report.body.error.code).toBe('FORBIDDEN');
    await staff.get(`/api/reports/revenue/export?${RANGE}`).expect(403);
  });

  it('totals the period by business day, employee and contract', async () => {
    const { first, second } = await seedLedger();
    const response = await owner.get(`/api/reports/revenue?${RANGE}`).expect(200);
    expect(response.body).toMatchObject({
      from: '2026-09-10',
      timeZone: 'Asia/Ho_Chi_Minh',
      to: '2026-09-11',
      totals: {
        cashVnd: 100_000,
        contractCount: 2,
        netVnd: 400_000,
        paymentCount: 4,
        refundVnd: 50_000,
        transferVnd: 350_000,
      },
    });
    expect(response.body.days).toMatchObject([
      { cashVnd: 100_000, day: '2026-09-10', netVnd: 400_000, transferVnd: 300_000 },
      { day: '2026-09-11', netVnd: 0, refundVnd: 50_000, transferVnd: 50_000 },
    ]);
    expect(response.body.employees).toMatchObject([
      { employeeName: 'Nhân viên', netVnd: 350_000, paymentCount: 3 },
      { employeeName: 'Chủ cửa hàng', netVnd: 50_000, paymentCount: 1 },
    ]);
    expect(response.body.rows).toMatchObject([
      {
        address: 'Cửa hàng',
        cashVnd: 50_000,
        code: first.code,
        contact: expect.stringContaining('0900'),
        customerName: 'Khách hàng mẫu',
        depositOrDocument: 'Cọc 500.000 ₫ · CCCD 0000',
        employeeName: 'Nhân viên',
        notes: 'Thu tại quầy',
        rentalDays: 4,
        returnAt: null,
        sequence: 1,
        time: '2026-09-09T17:30:00.000Z',
        transferVnd: 300_000,
        unitPriceVnd: 130_000,
        vehicleCodes: ['XE-001'],
      },
      {
        cashVnd: 0,
        code: second.code,
        employeeName: 'Chủ cửa hàng',
        sequence: 2,
        transferVnd: 50_000,
      },
    ]);
    expect(response.body.aging).toMatchObject({ count: 2, totalVnd: 260_000 });
    expect(response.body.aging.rows).toHaveLength(4);
  });

  it('exports the 14-column workbook with a totals row', async () => {
    await seedLedger();
    const response = await owner
      .get(`/api/reports/revenue/export?${RANGE}`)
      .buffer(true)
      .parse(binaryParser)
      .expect(200);
    expect(response.headers['content-type']).toContain('spreadsheetml.sheet');
    expect(response.headers['content-disposition']).toBe(
      'attachment; filename="doanh-thu-2026-09-10-2026-09-11.xlsx"',
    );
    const entries = readZipEntries(response.body as Buffer);
    expect(entries.get('xl/workbook.xml')).toContain('name="Doanh thu"');
    const sheet = entries.get('xl/worksheets/sheet1.xml') ?? '';
    expect(sheet).toContain('<t xml:space="preserve">Khách hàng</t>');
    expect(sheet).toContain('<t xml:space="preserve">Tổng cộng</t>');
    expect(sheet).toContain('<c r="I4"><v>350000</v></c>');
    expect(sheet).toContain('<c r="J4"><v>50000</v></c>');
  });

  it('rejects a reversed, oversized or malformed range and reports an empty period cleanly', async () => {
    await owner.get('/api/reports/revenue?from=2026-09-11&to=2026-09-10').expect(400);
    await owner.get('/api/reports/revenue?from=2026-06-01&to=2026-09-01').expect(400);
    await owner.get('/api/reports/revenue?from=2026-09-10').expect(400);
    await owner.get('/api/reports/revenue?from=10/09/2026&to=11/09/2026').expect(400);
    await owner.get('/api/reports/revenue/export?from=2026-09-11&to=2026-09-10').expect(400);
    const empty = await owner.get('/api/reports/revenue?from=2026-01-01&to=2026-01-31').expect(200);
    expect(empty.body).toMatchObject({
      days: [],
      employees: [],
      rows: [],
      totals: { contractCount: 0, netVnd: 0, paymentCount: 0 },
    });
  });
});
