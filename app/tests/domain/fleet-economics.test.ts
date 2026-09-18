import { breakEvenProjection, recoveredPercent } from '@rental/contracts';
import { describe, expect, it } from 'vitest';
import type { ExpenseRecord } from '../../apps/api/src/modules/economics/economics.types';
import {
  attributeExpenses,
  attributeRevenue,
  economicsRow,
  economicsTotals,
} from '../../apps/api/src/modules/economics/fleet-economics.policy';
import { economicsWindow } from '../../apps/api/src/modules/economics/fleet-economics.service';
import {
  chargeFixture,
  contractFixture,
  contractLine,
  vehicleFixture,
} from './support/contract-fixture';

const ACQUISITION = {
  purchasePriceVnd: 30_000_000,
  purchasedOn: '2026-01-15',
  salvageValueVnd: 3_000_000,
  usefulLifeMonths: 36,
};
const AS_OF = '2026-09-18';
const RETURN_AT = '2026-09-02T09:00:00.000Z';

function expense(overrides: Partial<ExpenseRecord> = {}): ExpenseRecord {
  return {
    amountVnd: 250_000,
    category: 'MAINTENANCE',
    createdAt: '2026-09-10T03:00:00.000Z',
    description: 'Thay nhớt',
    id: 'expense-1',
    method: 'CASH',
    notes: '',
    paidOn: '2026-09-10',
    recordedById: 'demo-staff',
    reference: '',
    reversalOfId: null,
    reversedByExpenseId: null,
    vehicleCode: 'XE-001',
    vehicleId: 'vehicle-001',
    ...overrides,
  };
}

describe('Scenario: Revenue is attributed to vehicles from contract lines and line-level charges', () => {
  const window = economicsWindow(AS_OF);
  const lines = [
    contractLine({
      billableDays: 4,
      dailyRateVnd: 130_000,
      endAt: '2026-09-05T08:00:00.000Z',
      finalSubtotalVnd: 520_000,
      id: 'line-1',
      startAt: '2026-09-01T08:00:00.000Z',
    }),
    contractLine({
      endAt: '2026-09-02T08:00:00.000Z',
      id: 'line-2',
      startAt: '2026-09-01T08:00:00.000Z',
      vehicleCode: 'XE-002',
      vehicleId: 'vehicle-002',
    }),
  ];
  const charges = [
    chargeFixture({ amountVnd: 40_000, createdAt: '2026-09-05T09:00:00.000Z', id: 'c1' }),
    chargeFixture({
      amountVnd: 100_000,
      createdAt: RETURN_AT,
      id: 'c2',
      kind: 'DAMAGE',
      lineId: 'line-2',
    }),
    chargeFixture({
      amountVnd: 10_000,
      createdAt: RETURN_AT,
      id: 'c3',
      kind: 'DISCOUNT',
      lineId: 'line-2',
    }),
    chargeFixture({
      amountVnd: 20_000,
      createdAt: RETURN_AT,
      id: 'c4',
      kind: 'DISCOUNT',
      lineId: null,
    }),
  ];
  const active = {
    ...contractFixture({ charges, deliveryFeeVnd: 30_000, lines, status: 'ACTIVE' }),
    activatedAt: '2026-09-01T08:00:00.000Z',
  };

  it('splits line money per vehicle and leaves contract-level money unallocated', () => {
    const revenue = attributeRevenue([active], window);
    expect(revenue.byVehicle.get('vehicle-001')).toEqual({
      rentalDays: 4,
      trailingVnd: 560_000,
      vnd: 560_000,
    });
    expect(revenue.byVehicle.get('vehicle-002')).toEqual({
      rentalDays: 1,
      trailingVnd: 240_000,
      vnd: 240_000,
    });
    expect(revenue.unallocated).toEqual({ trailingVnd: 10_000, vnd: 10_000 });
  });

  it('ignores bookings that never started and cancelled contracts', () => {
    const confirmed = contractFixture({ code: 'HD-2026-TEST0002', lines });
    const cancelled = {
      ...contractFixture({ code: 'HD-2026-TEST0003', lines, status: 'CANCELLED' }),
      activatedAt: '2026-09-01T08:00:00.000Z',
    };
    const revenue = attributeRevenue([confirmed, cancelled], window);
    expect(revenue.byVehicle.size).toBe(0);
    expect(revenue.unallocated.vnd).toBe(0);
  });

  it('keeps what a replaced line earned and leaves future lines out of the trailing window', () => {
    const swapped = {
      ...active,
      quote: {
        ...active.quote,
        lines: [
          { ...lines[0]!, replacedByLineId: 'line-3' },
          contractLine({
            id: 'line-3',
            startAt: '2026-06-01T08:00:00.000Z',
            vehicleId: 'vehicle-003',
          }),
          contractLine({
            id: 'line-4',
            startAt: '2026-10-01T08:00:00.000Z',
            vehicleId: 'vehicle-003',
          }),
        ],
      },
    };
    const revenue = attributeRevenue([swapped], window);
    expect(revenue.byVehicle.get('vehicle-001')?.vnd).toBe(560_000);
    expect(revenue.byVehicle.get('vehicle-003')).toEqual({
      rentalDays: 1,
      trailingVnd: 0,
      vnd: 150_000,
    });
  });

  it('attributes expenses by vehicle, subtracts reversals and skips future days', () => {
    const spent = attributeExpenses(
      [
        expense(),
        expense({ id: 'e2', paidOn: '2026-05-01' }),
        expense({ id: 'e3', paidOn: '2026-09-11', reversalOfId: 'expense-1' }),
        expense({
          amountVnd: 5_000_000,
          category: 'RENT',
          id: 'e4',
          vehicleCode: null,
          vehicleId: null,
        }),
        expense({ id: 'e5', paidOn: '2026-09-19' }),
      ],
      window,
    );
    expect(spent.byVehicle.get('vehicle-001')).toEqual({ trailingVnd: 0, vnd: 250_000 });
    expect(spent.unallocated).toEqual({ trailingVnd: 5_000_000, vnd: 5_000_000 });
  });
});

describe('Scenario Outline: Break-even is derived from cost, cumulative net and the trailing rate', () => {
  it.each([
    { cost: 0, months: null, net: 500_000, recovered: 0, status: 'NO_COST', trailing: 100_000 },
    {
      cost: 30_000_000,
      months: 0,
      net: 30_000_000,
      recovered: 100,
      status: 'RECOVERED',
      trailing: 0,
    },
    {
      cost: 30_000_000,
      months: 20,
      net: 10_000_000,
      recovered: 33,
      status: 'PROJECTED',
      trailing: 3_000_000,
    },
    {
      cost: 30_000_000,
      months: null,
      net: 10_000_000,
      recovered: 33,
      status: 'NOT_PROJECTABLE',
      trailing: 0,
    },
    {
      cost: 30_000_000,
      months: null,
      net: -500_000,
      recovered: 0,
      status: 'NOT_PROJECTABLE',
      trailing: -100_000,
    },
  ])(
    'cost $cost net $net trailing $trailing → $status',
    ({ cost, months, net, recovered, status, trailing }) => {
      const projection = breakEvenProjection({
        asOf: AS_OF,
        netVnd: net,
        purchasePriceVnd: cost,
        trailingNetVnd: trailing,
      });
      expect(projection.status).toBe(status);
      expect(projection.monthsRemaining).toBe(months);
      expect(projection.projectedOn).toBe(status === 'PROJECTED' ? '2028-05-18' : null);
      expect(recoveredPercent(cost, net)).toBe(recovered);
    },
  );

  it('builds a vehicle row and fleet totals that include the unallocated buckets', () => {
    const row = economicsRow(
      {
        acquisition: {
          ...ACQUISITION,
          updatedAt: '2026-09-18T00:00:00.000Z',
          updatedById: 'demo-owner',
          vehicleId: 'vehicle-001',
        },
        expenses: { trailingVnd: 250_000, vnd: 250_000 },
        revenue: { rentalDays: 4, trailingVnd: 560_000, vnd: 560_000 },
        vehicle: vehicleFixture(),
      },
      AS_OF,
    );
    expect(row).toMatchObject({
      accumulatedDepreciationVnd: 6_000_000,
      bookValueVnd: 24_000_000,
      breakEven: { status: 'PROJECTED' },
      code: 'XE-001',
      netVnd: 310_000,
      recoveredPercent: 1,
      rentalDays: 4,
    });
    const bare = economicsRow(
      {
        acquisition: null,
        expenses: undefined,
        revenue: undefined,
        vehicle: vehicleFixture({ id: 'vehicle-002' }),
      },
      AS_OF,
    );
    expect(bare).toMatchObject({ bookValueVnd: 0, breakEven: { status: 'NO_COST' }, netVnd: 0 });
    expect(economicsTotals([row, bare], { expensesVnd: 5_000_000, revenueVnd: 30_000 })).toEqual({
      accumulatedDepreciationVnd: 6_000_000,
      bookValueVnd: 24_000_000,
      expensesVnd: 5_250_000,
      netVnd: -4_660_000,
      purchasePriceVnd: 30_000_000,
      rentalDays: 4,
      revenueVnd: 590_000,
      unallocatedExpensesVnd: 5_000_000,
      unallocatedRevenueVnd: 30_000,
      vehicleCount: 2,
      vehiclesRecovered: 0,
    });
  });

  it('rejects a malformed as-of day before any ledger is read', () => {
    expect(() => economicsWindow('2026-13-40')).toThrowError(/không hợp lệ/u);
  });
});
