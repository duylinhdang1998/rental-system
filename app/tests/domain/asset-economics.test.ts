import {
  addMonths,
  depreciationAt,
  expenseInputSchema,
  monthsBetween,
  vehicleAcquisitionInputSchema,
} from '@rental/contracts';
import { describe, expect, it } from 'vitest';
import type { ExpenseRecord } from '../../apps/api/src/modules/economics/economics.types';
import {
  assertReversible,
  assertSameExpenseReplay,
  compareExpenses,
  expenseTotals,
  matchesExpenseFilter,
  reversalDraft,
} from '../../apps/api/src/modules/economics/expense.policy';

const ACQUISITION = {
  purchasePriceVnd: 30_000_000,
  purchasedOn: '2026-01-15',
  salvageValueVnd: 3_000_000,
  usefulLifeMonths: 36,
};
const ACTOR = { id: 'demo-owner', name: 'Chủ cửa hàng', role: 'OWNER' as const };
const AS_OF = '2026-09-18';

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

describe('Scenario Outline: Straight-line depreciation is derived from the acquisition record', () => {
  it.each([
    { accumulated: 6_000_000, asOf: '2026-09-18', bookValue: 24_000_000, months: 8 },
    { accumulated: 5_250_000, asOf: '2026-09-14', bookValue: 24_750_000, months: 7 },
    { accumulated: 27_000_000, asOf: '2030-01-15', bookValue: 3_000_000, months: 48 },
  ])('as of $asOf → $months months', ({ accumulated, asOf, bookValue, months }) => {
    expect(depreciationAt(ACQUISITION, asOf)).toEqual({
      accumulatedDepreciationVnd: accumulated,
      bookValueVnd: bookValue,
      monthlyDepreciationVnd: 750_000,
      monthsElapsed: months,
    });
  });

  it('counts zero months on the purchase day and floors uneven divisions', () => {
    expect(depreciationAt({ ...ACQUISITION, purchasedOn: AS_OF }, AS_OF)).toMatchObject({
      accumulatedDepreciationVnd: 0,
      bookValueVnd: 30_000_000,
      monthsElapsed: 0,
    });
    expect(
      depreciationAt(
        {
          purchasePriceVnd: 10_000_000,
          purchasedOn: '2026-01-01',
          salvageValueVnd: 0,
          usefulLifeMonths: 3,
        },
        '2026-02-15',
      ),
    ).toEqual({
      accumulatedDepreciationVnd: 3_333_333,
      bookValueVnd: 6_666_667,
      monthlyDepreciationVnd: 3_333_333,
      monthsElapsed: 1,
    });
  });

  it('never counts negative months and rolls month arithmetic forward', () => {
    expect(monthsBetween('2026-09-18', '2026-01-15')).toBe(0);
    expect(addMonths('2026-09-18', 20)).toBe('2028-05-18');
    expect(addMonths('2026-01-31', 1)).toBe('2026-03-03');
  });
});

describe('Scenario Outline: Acquisition input is validated', () => {
  it.each([
    [30_000_000, 36, 3_000_000, true],
    [0, 12, 0, true],
    [30_000_000, 0, 0, false],
    [30_000_000, 241, 0, false],
    [30_000_000, 36, 30_000_001, false],
  ])('price %i, life %i, salvage %i → valid %s', (price, life, salvage, valid) => {
    const result = vehicleAcquisitionInputSchema.safeParse({
      purchasePriceVnd: price,
      purchasedOn: '2026-01-15',
      salvageValueVnd: salvage,
      usefulLifeMonths: life,
    });
    expect(result.success).toBe(valid);
  });

  it('defaults optional expense fields and rejects unknown keys', () => {
    const parsed = expenseInputSchema.parse({
      amountVnd: 250_000,
      category: 'FUEL',
      description: 'Đổ xăng',
      idempotencyKey: crypto.randomUUID(),
      method: 'CASH',
      paidOn: '2026-09-10',
    });
    expect(parsed).toMatchObject({ notes: '', reference: '', vehicleId: null });
    expect(expenseInputSchema.safeParse({ ...parsed, extra: 1 }).success).toBe(false);
    expect(expenseInputSchema.safeParse({ ...parsed, amountVnd: 0 }).success).toBe(false);
  });
});

describe('Scenario: Expense ledger policy — totals, filters and reversals (BR-09)', () => {
  const reversal = expense({
    createdAt: '2026-09-11T03:00:00.000Z',
    description: 'Đảo: Nhập nhầm xe',
    id: 'expense-2',
    recordedById: 'demo-owner',
    reversalOfId: 'expense-1',
  });
  const rent = expense({
    amountVnd: 5_000_000,
    category: 'RENT',
    id: 'expense-3',
    method: 'BANK_TRANSFER',
    paidOn: '2026-09-12',
    vehicleCode: null,
    vehicleId: null,
  });

  it('nets reversals out by method and category', () => {
    expect(expenseTotals([expense({ reversedByExpenseId: 'expense-2' }), reversal, rent])).toEqual({
      byCategory: [
        { category: 'MAINTENANCE', netVnd: 0 },
        { category: 'RENT', netVnd: 5_000_000 },
      ],
      cashVnd: 0,
      netVnd: 5_000_000,
      reversedVnd: 250_000,
      transferVnd: 5_000_000,
    });
  });

  it('matches filters on paid day, category and vehicle and sorts newest paid day first', () => {
    expect(matchesExpenseFilter(rent, { from: '2026-09-05', to: '2026-09-12' })).toBe(true);
    expect(matchesExpenseFilter(rent, { to: '2026-09-11' })).toBe(false);
    expect(matchesExpenseFilter(rent, { category: 'FUEL' })).toBe(false);
    expect(matchesExpenseFilter(expense(), { vehicleId: 'vehicle-001' })).toBe(true);
    expect([expense(), rent, reversal].sort(compareExpenses).map((item) => item.id)).toEqual([
      'expense-3',
      'expense-2',
      'expense-1',
    ]);
  });

  it('drafts a mirror-image reversal and refuses double or nested reversals', () => {
    const draft = reversalDraft(expense(), 'Nhập nhầm xe', ACTOR);
    expect(draft).toMatchObject({
      amountVnd: 250_000,
      description: 'Đảo: Nhập nhầm xe',
      paidOn: '2026-09-10',
      recordedById: 'demo-owner',
      reversalOfId: 'expense-1',
      vehicleId: 'vehicle-001',
    });
    expect(() => assertReversible(expense())).not.toThrow();
    expect(() => assertReversible(reversal)).toThrowError(/bút toán đảo/u);
    expect(() => assertReversible(expense({ reversedByExpenseId: 'expense-2' }))).toThrowError(
      /đã được đảo/u,
    );
  });

  it('treats a replay with different money as a conflict', () => {
    const input = expenseInputSchema.parse({
      amountVnd: 250_000,
      category: 'MAINTENANCE',
      description: 'Thay nhớt',
      idempotencyKey: crypto.randomUUID(),
      method: 'CASH',
      paidOn: '2026-09-10',
      vehicleId: 'vehicle-001',
    });
    expect(() => assertSameExpenseReplay(expense(), input)).not.toThrow();
    expect(() => assertSameExpenseReplay(expense(), { ...input, amountVnd: 1 })).toThrowError(
      /Khóa giao dịch/u,
    );
  });
});
