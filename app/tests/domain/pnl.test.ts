import {
  monthEnd,
  monthsEnding,
  pnlQuerySchema,
  previousMonth,
  type VehicleAcquisition,
} from '@rental/contracts';
import { describe, expect, it } from 'vitest';
import type { ExpenseRecord } from '../../apps/api/src/modules/economics/economics.types';
import {
  monthlyDepreciation,
  monthlyExpenses,
  monthlyRevenue,
  pnlMonths,
  pnlTotals,
} from '../../apps/api/src/modules/analytics/pnl.policy';
import { monthWindow } from '../../apps/api/src/modules/analytics/pnl.service';
import type { RevenueEvent } from '../../apps/api/src/modules/analytics/revenue-events.policy';

const ACQUISITION: VehicleAcquisition = {
  purchasePriceVnd: 30_000_000,
  purchasedOn: '2026-01-15',
  salvageValueVnd: 3_000_000,
  updatedAt: '2026-01-15T03:00:00.000Z',
  updatedById: 'demo-owner',
  usefulLifeMonths: 36,
  vehicleId: 'vehicle-001',
};
const MONTHLY_DEPRECIATION = 750_000;

function revenue(at: string, vnd: number): RevenueEvent {
  return {
    at,
    contractId: 'hd-1',
    customerId: 'demo-customer',
    kind: 'RENTAL',
    rentalDays: 1,
    vehicleCode: 'XE-001',
    vehicleId: 'vehicle-001',
    vnd,
  };
}

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

const EVENTS = [
  revenue('2026-09-05T03:00:00.000Z', 570_000),
  revenue('2026-08-10T03:00:00.000Z', 300_000),
];
const EXPENSES = [
  expense(),
  expense({ id: 'expense-2', paidOn: '2026-09-12', reversalOfId: 'expense-1' }),
  expense({ amountVnd: 5_000_000, category: 'INSURANCE', id: 'expense-3', paidOn: '2026-08-01' }),
];
const MONTHS = monthsEnding('2026-09', 12);

describe('Scenario: Monthly profit and loss subtracts expenses and straight-line depreciation', () => {
  const rows = pnlMonths({
    acquisitions: [ACQUISITION],
    events: EVENTS,
    expenses: EXPENSES,
    months: MONTHS,
  });
  const byMonth = new Map(rows.map((row) => [row.month, row]));

  it('books September revenue, a reversed expense and one month of depreciation', () => {
    expect(byMonth.get('2026-09')).toEqual({
      depreciationVnd: MONTHLY_DEPRECIATION,
      expensesVnd: 0,
      month: '2026-09',
      profitVnd: -180_000,
      revenueVnd: 570_000,
    });
    expect(byMonth.get('2026-08')).toEqual({
      depreciationVnd: MONTHLY_DEPRECIATION,
      expensesVnd: 5_000_000,
      month: '2026-08',
      profitVnd: -5_450_000,
      revenueVnd: 300_000,
    });
  });

  it('starts depreciating the month after the purchase', () => {
    expect(byMonth.get('2025-10')?.depreciationVnd).toBe(0);
    expect(byMonth.get('2026-01')?.depreciationVnd).toBe(0);
    expect(byMonth.get('2026-02')?.depreciationVnd).toBe(MONTHLY_DEPRECIATION);
    expect(monthlyDepreciation([ACQUISITION], '2029-02')).toBe(0);
  });

  it('lists the twelve months oldest first and sums them in the totals', () => {
    expect(rows.map((row) => row.month)).toEqual(MONTHS);
    expect(MONTHS[0]).toBe('2025-10');
    expect(pnlTotals(rows)).toEqual({
      depreciationVnd: 8 * MONTHLY_DEPRECIATION,
      expensesVnd: 5_000_000,
      profitVnd: 870_000 - 5_000_000 - 8 * MONTHLY_DEPRECIATION,
      revenueVnd: 870_000,
    });
  });

  it('keys revenue and expenses by business month', () => {
    expect(monthlyRevenue([revenue('2026-08-31T17:30:00.000Z', 1)]).get('2026-09')).toBe(1);
    expect(monthlyExpenses(EXPENSES).get('2026-09')).toBe(0);
    expect(monthlyExpenses(EXPENSES).get('2026-08')).toBe(5_000_000);
  });
});

describe('Scenario Outline: The profit and loss query is validated', () => {
  it.each([
    ['12', '2026-09', true],
    ['1', '2026-01', true],
    ['24', '2026-09', true],
    ['0', '2026-09', false],
    ['25', '2026-09', false],
    ['12', '2026-9', false],
    ['12', '2026-13', false],
  ])('months=%s to=%s → valid %s', (months, to, valid) => {
    expect(pnlQuerySchema.safeParse({ months, to }).success).toBe(valid);
  });

  it('defaults to twelve months and derives the window from the month span', () => {
    expect(pnlQuerySchema.parse({})).toEqual({ months: 12 });
    expect(previousMonth('2026-01')).toBe('2025-12');
    expect(monthEnd('2026-02')).toBe('2026-02-28');
    expect(monthsEnding('2026-02', 3)).toEqual(['2025-12', '2026-01', '2026-02']);
    expect(monthWindow('2025-10', '2026-09')).toEqual({
      endAt: new Date('2026-09-30T17:00:00.000Z'),
      startAt: new Date('2025-09-30T17:00:00.000Z'),
    });
  });
});
