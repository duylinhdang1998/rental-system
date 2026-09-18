import { describe, expect, it } from 'vitest';
import { analyticsWindow } from '../../apps/api/src/modules/analytics/analytics-window';
import {
  UNALLOCATED_LABEL,
  UNKNOWN_NATIONALITY,
  analyticsTotals,
  dimensionRows,
  monthRows,
  nationalityDimension,
  surchargeRows,
  typeDimension,
  vehicleDimension,
} from '../../apps/api/src/modules/analytics/analytics.policy';
import {
  eventsInWindow,
  revenueEvents,
} from '../../apps/api/src/modules/analytics/revenue-events.policy';
import {
  chargeFixture,
  contractFixture,
  contractLine,
  vehicleFixture,
} from './support/contract-fixture';

const WINDOW = analyticsWindow({ from: '2026-09-01', to: '2026-09-30' });
const VEHICLES = new Map([
  ['vehicle-001', vehicleFixture()],
  ['vehicle-002', vehicleFixture({ code: 'XE-002', id: 'vehicle-002' })],
]);
const TYPE_NAMES = new Map([['SCOOTER', 'Xe tay ga']]);
const NATIONALITIES = new Map([['demo-customer', 'VN']]);
const ACTIVATED_AT = '2026-09-01T07:00:00.000Z';

const fourDays = contractLine({
  billableDays: 4,
  dailyRateVnd: 130_000,
  endAt: '2026-09-05T08:00:00.000Z',
  finalSubtotalVnd: 520_000,
  startAt: '2026-09-01T08:00:00.000Z',
});
const goldenCharges = [
  chargeFixture({
    amountVnd: 40_000,
    createdAt: '2026-09-05T09:00:00.000Z',
    id: 'c1',
    kind: 'OTHER',
  }),
  chargeFixture({
    amountVnd: 20_000,
    createdAt: '2026-09-06T09:00:00.000Z',
    id: 'c2',
    kind: 'DISCOUNT',
    lineId: null,
  }),
];
const golden = {
  ...contractFixture({
    charges: goldenCharges,
    deliveryFeeVnd: 30_000,
    lines: [fourDays],
    status: 'ACTIVE',
  }),
  activatedAt: ACTIVATED_AT,
};
const events = eventsInWindow(revenueEvents([golden]), WINDOW);
const totals = analyticsTotals(events);

describe('Scenario: Revenue events are accrued once and every dimension reconciles to the same total', () => {
  it('totals 570 000 over 4 rental days and 1 contract, net surcharges 20 000, unallocated 10 000', () => {
    expect(events).toHaveLength(4);
    expect(totals).toEqual({
      contractCount: 1,
      rentalDays: 4,
      revenueVnd: 570_000,
      surchargeNetVnd: 20_000,
      unallocatedVnd: 10_000,
    });
  });

  it('splits by vehicle type with the unallocated row last', () => {
    expect(dimensionRows(events, typeDimension(VEHICLES, TYPE_NAMES), totals.revenueVnd)).toEqual([
      {
        contractCount: 1,
        key: 'SCOOTER',
        label: 'Xe tay ga',
        rentalDays: 4,
        revenueVnd: 560_000,
        sharePercent: 98,
      },
      {
        contractCount: 1,
        key: 'unallocated',
        label: UNALLOCATED_LABEL,
        rentalDays: 0,
        revenueVnd: 10_000,
        sharePercent: 1,
      },
    ]);
  });

  it('splits by vehicle with the same figures', () => {
    const rows = dimensionRows(events, vehicleDimension(VEHICLES), totals.revenueVnd);
    expect(rows[0]).toMatchObject({
      key: 'vehicle-001',
      label: 'XE-001',
      rentalDays: 4,
      revenueVnd: 560_000,
      sharePercent: 98,
    });
    expect(rows[1]).toMatchObject({ key: 'unallocated', revenueVnd: 10_000 });
    expect(rows.reduce((sum, row) => sum + row.revenueVnd, 0)).toBe(totals.revenueVnd);
  });

  it('attributes everything, delivery fee and discount included, to the customer nationality', () => {
    expect(dimensionRows(events, nationalityDimension(NATIONALITIES), totals.revenueVnd)).toEqual([
      {
        contractCount: 1,
        key: 'VN',
        label: 'VN',
        rentalDays: 4,
        revenueVnd: 570_000,
        sharePercent: 100,
      },
    ]);
    const unknown = dimensionRows(events, nationalityDimension(new Map()), totals.revenueVnd);
    expect(unknown[0]).toMatchObject({ key: 'UNKNOWN', label: UNKNOWN_NATIONALITY });
  });

  it('groups by business month', () => {
    expect(monthRows(events)).toEqual([
      { contractCount: 1, month: '2026-09', rentalDays: 4, revenueVnd: 570_000 },
    ]);
  });

  it('ignores a CONFIRMED booking and a cancelled contract', () => {
    const booking = contractFixture({ code: 'HD-2026-TEST0002', lines: [fourDays] });
    const cancelled = {
      ...contractFixture({ code: 'HD-2026-TEST0003', lines: [fourDays], status: 'CANCELLED' }),
      activatedAt: ACTIVATED_AT,
    };
    expect(revenueEvents([booking, cancelled])).toEqual([]);
  });

  it('orders dimension rows by revenue and keeps the unallocated bucket last', () => {
    const second = {
      ...contractFixture({
        code: 'HD-2026-TEST0004',
        lines: [
          contractLine({
            billableDays: 1,
            finalSubtotalVnd: 150_000,
            startAt: '2026-09-10T08:00:00.000Z',
            vehicleCode: 'XE-002',
            vehicleId: 'vehicle-002',
          }),
        ],
        status: 'ACTIVE',
      }),
      activatedAt: '2026-09-10T08:00:00.000Z',
    };
    const all = eventsInWindow(revenueEvents([second, golden]), WINDOW);
    const rows = dimensionRows(all, vehicleDimension(VEHICLES), analyticsTotals(all).revenueVnd);
    expect(rows.map((row) => row.label)).toEqual(['XE-001', 'XE-002', UNALLOCATED_LABEL]);
  });
});

describe('Scenario: Surcharges are grouped by kind with counts and unsigned amounts', () => {
  const surcharge = (
    id: string,
    kind: string,
    amountVnd: number,
    createdAt = '2026-09-07T09:00:00.000Z',
  ) => chargeFixture({ amountVnd, createdAt, id, kind: kind as never });
  const contract = {
    ...contractFixture({
      charges: [
        surcharge('c1', 'LATE_RETURN', 40_000),
        surcharge('c2', 'DAMAGE', 150_000),
        surcharge('c3', 'DAMAGE', 180_000),
        surcharge('c4', 'OTHER', 30_000),
        surcharge('c5', 'DISCOUNT', 20_000),
        surcharge('c6', 'DAMAGE', 999_000, '2026-10-05T09:00:00.000Z'),
      ],
      lines: [fourDays],
      status: 'ACTIVE',
    }),
    activatedAt: ACTIVATED_AT,
  };
  const inWindow = eventsInWindow(revenueEvents([contract]), WINDOW);

  it('lists every kind in a fixed order and nets discounts against the rest', () => {
    expect(surchargeRows(inWindow)).toEqual([
      { amountVnd: 40_000, count: 1, kind: 'LATE_RETURN' },
      { amountVnd: 330_000, count: 2, kind: 'DAMAGE' },
      { amountVnd: 30_000, count: 1, kind: 'OTHER' },
      { amountVnd: 20_000, count: 1, kind: 'DISCOUNT' },
    ]);
    expect(analyticsTotals(inWindow).surchargeNetVnd).toBe(380_000);
  });
});

describe('Scenario: The analytics window allows up to 366 days', () => {
  it('accepts a leap-safe year and rejects anything longer, reversed or malformed', () => {
    expect(analyticsWindow({ from: '2025-09-18', to: '2026-09-18' }).days).toBe(366);
    expect(() => analyticsWindow({ from: '2025-09-17', to: '2026-09-18' })).toThrow(
      'Báo cáo tối đa 366 ngày',
    );
    expect(() => analyticsWindow({ from: '2026-09-18', to: '2026-09-17' })).toThrow();
    expect(() => analyticsWindow({ from: 'x', to: '2026-09-17' })).toThrow();
    expect(WINDOW).toMatchObject({
      endAt: new Date('2026-09-30T17:00:00.000Z'),
      startAt: new Date('2026-08-31T17:00:00.000Z'),
      timeZone: 'Asia/Ho_Chi_Minh',
    });
  });
});
