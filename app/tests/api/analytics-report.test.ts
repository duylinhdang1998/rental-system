import type { INestApplication } from '@nestjs/common';
import type { IncomingMessage } from 'node:http';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApiApp } from '../../apps/api/src/main';
import { readZipEntries } from '../domain/support/xlsx-reader';
import { LifecycleClient, contractInput, type Interval } from './support/lifecycle-client';

/** Four days at the 3–6 day tier (130 000 ₫/day) = 520 000 ₫, the golden contract of the feature file. */
const GOLDEN: Interval = {
  endAt: '2026-09-05T08:00:00.000Z',
  startAt: '2026-09-01T08:00:00.000Z',
};
const RANGE = 'from=2026-09-01&to=2026-09-30';

function binaryParser(
  response: IncomingMessage,
  callback: (error: Error | null, body: Buffer) => void,
) {
  const chunks: Buffer[] = [];
  response.on('data', (chunk: Buffer) => chunks.push(chunk));
  response.on('end', () => callback(null, Buffer.concat(chunks)));
}

describe('Feature: Multi-dimensional revenue analytics (US-029, BR-08)', () => {
  let app: INestApplication;
  let staff: LifecycleClient;
  let owner: LifecycleClient;

  beforeEach(async () => {
    app = await createApiApp({ demoMode: true, nodeEnv: 'test' });
    staff = await new LifecycleClient(app).login();
    owner = await new LifecycleClient(app).login('owner', 'OwnerDemo!2026');
  });

  afterEach(async () => app.close());

  /** Golden contract: 520 000 rental + 30 000 delivery + 40 000 line OTHER − 20 000 contract DISCOUNT. */
  async function seedGolden() {
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
    await staff.createContract(['vehicle-003']);
    return id;
  }

  it('answers the Owner with every dimension reconciled to one total', async () => {
    await seedGolden();
    const response = await owner.get(`/api/reports/analytics?${RANGE}`).expect(200);
    expect(response.body).toMatchObject({
      from: '2026-09-01',
      timeZone: 'Asia/Ho_Chi_Minh',
      to: '2026-09-30',
      totals: {
        contractCount: 1,
        rentalDays: 4,
        revenueVnd: 570_000,
        surchargeNetVnd: 20_000,
        unallocatedVnd: 10_000,
      },
    });
    expect(response.body.byType).toMatchObject([
      { key: 'SCOOTER', label: 'Xe tay ga', rentalDays: 4, revenueVnd: 560_000, sharePercent: 98 },
      { key: 'unallocated', label: 'Chưa phân bổ', revenueVnd: 10_000 },
    ]);
    expect(response.body.byVehicle).toMatchObject([
      { label: 'XE-001', revenueVnd: 560_000 },
      { key: 'unallocated', revenueVnd: 10_000 },
    ]);
    expect(response.body.byNationality).toEqual([
      {
        contractCount: 1,
        key: 'VN',
        label: 'VN',
        rentalDays: 4,
        revenueVnd: 570_000,
        sharePercent: 100,
      },
    ]);
    expect(response.body.byMonth).toEqual([
      { contractCount: 1, month: '2026-09', rentalDays: 4, revenueVnd: 570_000 },
    ]);
    expect(response.body.surcharges).toEqual([
      { amountVnd: 0, count: 0, kind: 'LATE_RETURN' },
      { amountVnd: 0, count: 0, kind: 'DAMAGE' },
      { amountVnd: 40_000, count: 1, kind: 'OTHER' },
      { amountVnd: 20_000, count: 1, kind: 'DISCOUNT' },
    ]);
    expect(response.body.utilisation.byVehicle).toMatchObject([
      { availableDays: 30, label: 'XE-001', rentedDays: 4, utilisationPercent: 13 },
      { availableDays: 30, label: 'XE-002', rentedDays: 0, utilisationPercent: 0 },
      { availableDays: 30, label: 'XE-003', rentedDays: 0 },
    ]);
    expect(response.body.utilisation.byType).toMatchObject([
      {
        availableDays: 90,
        key: 'SCOOTER',
        label: 'Xe tay ga',
        rentedDays: 4,
        utilisationPercent: 4,
      },
    ]);
    expect(response.body.utilisation.fleet).toEqual({
      availableDays: 90,
      rentedDays: 4,
      utilisationPercent: 4,
    });
  });

  it('rejects more than 366 days, reversed or malformed ranges and refuses Staff (BR-08)', async () => {
    const tooLong = await owner
      .get('/api/reports/analytics?from=2025-09-17&to=2026-09-18')
      .expect(400);
    expect(tooLong.body.error.code).toBe('INVALID_INPUT');
    await owner.get('/api/reports/analytics?from=2025-09-18&to=2026-09-18').expect(200);
    await owner.get('/api/reports/analytics?from=2026-09-11&to=2026-09-10').expect(400);
    await owner.get('/api/reports/analytics?from=2026-09-10').expect(400);
    await owner.get('/api/reports/analytics/export?from=2025-01-01&to=2026-09-18').expect(400);
    const denied = await staff.get(`/api/reports/analytics?${RANGE}`).expect(403);
    expect(denied.body.error.code).toBe('FORBIDDEN');
    await staff.get(`/api/reports/analytics/export?${RANGE}`).expect(403);
  });

  it('reports an empty range with zero totals and the fleet still listed', async () => {
    const empty = await owner
      .get('/api/reports/analytics?from=2026-01-01&to=2026-01-31')
      .expect(200);
    expect(empty.body).toMatchObject({
      byMonth: [],
      byNationality: [],
      byType: [],
      byVehicle: [],
      totals: { contractCount: 0, rentalDays: 0, revenueVnd: 0 },
    });
    expect(empty.body.surcharges).toHaveLength(4);
    expect(empty.body.utilisation.byVehicle).toHaveLength(3);
    expect(empty.body.utilisation.fleet).toEqual({
      availableDays: 0,
      rentedDays: 0,
      utilisationPercent: 0,
    });
  });

  it('exports one sheet per dimension in a single workbook', async () => {
    await seedGolden();
    const response = await owner
      .get(`/api/reports/analytics/export?${RANGE}`)
      .buffer(true)
      .parse(binaryParser)
      .expect(200);
    expect(response.headers['content-type']).toContain('spreadsheetml.sheet');
    expect(response.headers['content-disposition']).toBe(
      'attachment; filename="phan-tich-2026-09-01-2026-09-30.xlsx"',
    );
    const entries = readZipEntries(response.body as Buffer);
    const workbook = entries.get('xl/workbook.xml') ?? '';
    for (const name of ['Loại xe', 'Xe', 'Quốc tịch', 'Tháng', 'Phụ phí', 'Sử dụng xe']) {
      expect(workbook).toContain(`name="${name}"`);
    }
    expect(entries.get('[Content_Types].xml')).toContain('sheet6.xml');
    const vehicles = entries.get('xl/worksheets/sheet2.xml') ?? '';
    expect(vehicles).toContain('<t xml:space="preserve">XE-001</t>');
    expect(vehicles).toContain('<v>560000</v>');
    expect(vehicles).toContain('<t xml:space="preserve">Tổng cộng</t>');
    const utilisation = entries.get('xl/worksheets/sheet6.xml') ?? '';
    expect(utilisation).toContain('<t xml:space="preserve">Toàn đội</t>');
  });
});
