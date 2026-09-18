import {
  cashNoteRequired,
  cashShiftCloseInputSchema,
  cashShiftOpenInputSchema,
  cashVariance,
  expectedCash,
  type AuthenticatedUser,
} from '@rental/contracts';
import { describe, expect, it } from 'vitest';
import {
  buildExpectation,
  canCloseShift,
  cashMovements,
  closeDraft,
} from '../../apps/api/src/modules/cash-shifts/cash-shift.policy';
import type { CashShiftRecord } from '../../apps/api/src/modules/cash-shifts/cash-shift.types';
import { DemoCashShiftRepository } from '../../apps/api/src/modules/cash-shifts/demo-cash-shift.repository';
import type { ExpenseRecord } from '../../apps/api/src/modules/economics/economics.types';
import { contractFixture, paymentFixture } from './support/contract-fixture';

const OPENED_AT = '2026-09-18T01:00:00.000Z';
const AS_OF = new Date('2026-09-18T09:00:00.000Z');
const WINDOW = { endAt: AS_OF.getTime(), startAt: Date.parse(OPENED_AT) };
const STAFF: AuthenticatedUser = {
  id: 'staff-1',
  name: 'Nhân viên',
  role: 'STAFF',
  username: 'staff',
};
const OWNER: AuthenticatedUser = { id: 'owner-1', name: 'Chủ', role: 'OWNER', username: 'owner' };

function shift(overrides: Partial<CashShiftRecord> = {}): CashShiftRecord {
  return {
    closedAt: null,
    closedById: null,
    countedCashVnd: null,
    expectedCashVnd: null,
    id: 'shift-1',
    note: '',
    openedAt: OPENED_AT,
    openedById: 'staff-1',
    openingFloatVnd: 500_000,
    status: 'OPEN',
    varianceVnd: null,
    ...overrides,
  };
}

function expense(overrides: Partial<ExpenseRecord> = {}): ExpenseRecord {
  return {
    amountVnd: 200_000,
    category: 'FUEL',
    createdAt: '2026-09-18T02:00:00.000Z',
    description: 'Đổ xăng',
    id: 'expense-1',
    method: 'CASH',
    notes: '',
    paidOn: '2026-09-18',
    recordedById: 'staff-1',
    reference: '',
    reversalOfId: null,
    reversedByExpenseId: null,
    vehicleCode: 'XE-001',
    vehicleId: 'vehicle-001',
    ...overrides,
  };
}

const IN_SHIFT = '2026-09-18T03:00:00.000Z';
const contracts = [
  contractFixture({
    code: 'HD-2026-A',
    payments: [
      paymentFixture({ amountVnd: 300_000, id: 'p1', receivedAt: IN_SHIFT }),
      paymentFixture({ amountVnd: 50_000, id: 'p2', kind: 'REFUND', receivedAt: IN_SHIFT }),
      paymentFixture({
        amountVnd: 200_000,
        id: 'p3',
        kind: 'DEPOSIT_REFUND',
        receivedAt: IN_SHIFT,
      }),
      paymentFixture({
        amountVnd: 999,
        id: 'p-transfer',
        method: 'BANK_TRANSFER',
        receivedAt: IN_SHIFT,
      }),
      paymentFixture({ amountVnd: 999, id: 'p-before', receivedAt: '2026-09-18T00:59:59.000Z' }),
      paymentFixture({ amountVnd: 999, id: 'p-after', receivedAt: '2026-09-18T09:00:00.000Z' }),
    ],
  }),
];
const expenses = [
  expense(),
  expense({ amountVnd: 80_000, id: 'expense-2' }),
  expense({ amountVnd: 80_000, id: 'expense-3', reversalOfId: 'expense-2' }),
  expense({ amountVnd: 999, id: 'expense-transfer', method: 'BANK_TRANSFER' }),
  expense({ amountVnd: 999, createdAt: '2026-09-17T23:00:00.000Z', id: 'expense-before' }),
];

describe('Feature: Cash shift — shared arithmetic (US-027, BR-10)', () => {
  it('derives expected cash, the variance and when a note is required', () => {
    const movements = {
      cashCollectedVnd: 300_000,
      cashExpensesVnd: 200_000,
      cashRefundedVnd: 50_000,
      depositRefundedVnd: 200_000,
    };
    expect(expectedCash(500_000, movements)).toBe(350_000);
    expect(cashVariance(340_000, 350_000)).toBe(-10_000);
    expect(cashNoteRequired(0, '')).toBe(false);
    expect(cashNoteRequired(-10_000, '')).toBe(true);
    expect(cashNoteRequired(-10_000, 'Thiếu 10k tiền lẻ')).toBe(false);
    expect(cashShiftOpenInputSchema.parse({ openingFloatVnd: 0 })).toEqual({ openingFloatVnd: 0 });
    expect(() => cashShiftOpenInputSchema.parse({ openingFloatVnd: -1 })).toThrow();
    expect(cashShiftCloseInputSchema.parse({ countedCashVnd: 10 })).toEqual({
      countedCashVnd: 10,
      note: '',
    });
    expect(() => cashShiftCloseInputSchema.parse({ countedCashVnd: 10, extra: 1 })).toThrow();
  });

  it('counts only cash that moved while the shift was open and nets expense reversals', () => {
    expect(cashMovements(contracts, expenses, WINDOW)).toEqual({
      cashCollectedVnd: 300_000,
      cashExpensesVnd: 200_000,
      cashRefundedVnd: 50_000,
      depositRefundedVnd: 200_000,
    });
    expect(buildExpectation(shift(), cashMovements(contracts, expenses, WINDOW), AS_OF)).toEqual({
      asOf: AS_OF.toISOString(),
      cashCollectedVnd: 300_000,
      cashExpensesVnd: 200_000,
      cashRefundedVnd: 50_000,
      depositRefundedVnd: 200_000,
      expectedCashVnd: 350_000,
      openingFloatVnd: 500_000,
    });
  });

  it('freezes the close figures and demands a note on any variance', () => {
    const expectation = buildExpectation(
      shift(),
      cashMovements(contracts, expenses, WINDOW),
      AS_OF,
    );
    expect(
      closeDraft(
        expectation,
        { countedCashVnd: 350_000, note: '' },
        'staff-1',
        AS_OF.toISOString(),
      ),
    ).toEqual({
      closedAt: AS_OF.toISOString(),
      closedById: 'staff-1',
      countedCashVnd: 350_000,
      expectedCashVnd: 350_000,
      note: '',
      varianceVnd: 0,
    });
    expect(() =>
      closeDraft(
        expectation,
        { countedCashVnd: 360_000, note: '' },
        'staff-1',
        AS_OF.toISOString(),
      ),
    ).toThrow('Ghi chú bắt buộc');
    expect(
      closeDraft(
        expectation,
        { countedCashVnd: 360_000, note: 'Thừa' },
        'staff-1',
        AS_OF.toISOString(),
      ),
    ).toMatchObject({ note: 'Thừa', varianceVnd: 10_000 });
  });

  it('lets the opener or the Owner close a shift (BR-08)', () => {
    expect(canCloseShift(shift(), STAFF)).toBe(true);
    expect(canCloseShift(shift({ openedById: 'other' }), STAFF)).toBe(false);
    expect(canCloseShift(shift({ openedById: 'other' }), OWNER)).toBe(true);
  });
});

describe('Feature: Cash shift — demo repository', () => {
  it('keeps one open shift, closes it and lists newest first per opener', async () => {
    const repository = new DemoCashShiftRepository();
    const first = await repository.create({
      openedAt: OPENED_AT,
      openedById: 'staff-1',
      openingFloatVnd: 500_000,
    });
    await expect(
      repository.create({ openedAt: OPENED_AT, openedById: 'owner-1', openingFloatVnd: 0 }),
    ).rejects.toMatchObject({ code: 'CASH_SHIFT_ALREADY_OPEN' });
    await expect(repository.findOpen()).resolves.toMatchObject({ id: first.id });
    const closed = await repository.close(first.id, {
      closedAt: AS_OF.toISOString(),
      closedById: 'owner-1',
      countedCashVnd: 1,
      expectedCashVnd: 1,
      note: '',
      varianceVnd: 0,
    });
    expect(closed).toMatchObject({ closedById: 'owner-1', status: 'CLOSED' });
    await expect(repository.findOpen()).resolves.toBeNull();
    const second = await repository.create({
      openedAt: '2026-09-19T01:00:00.000Z',
      openedById: 'owner-1',
      openingFloatVnd: 0,
    });
    expect((await repository.list()).map((entry) => entry.id)).toEqual([second.id, first.id]);
    expect((await repository.list('staff-1')).map((entry) => entry.id)).toEqual([first.id]);
    await expect(repository.findById('missing')).resolves.toBeNull();
    await expect(repository.close('missing', closed)).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});
