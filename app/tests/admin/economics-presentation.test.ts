import type { Expense, FleetEconomicsRow, FleetEconomicsTotals } from '@rental/contracts';
import { describe, expect, it } from 'vitest';
import {
  expenseBlocked,
  expenseQueryFrom,
  expenseReversible,
  expenseStatus,
  formatPaidOn,
  initialExpenseForm,
  signedExpenseAmount,
  toExpenseInput,
  vehicleOptions,
} from '../../apps/admin/src/features/expenses/lib/expense-presentation';
import {
  INITIAL_ACQUISITION_FORM,
  acquisitionFormFrom,
  acquisitionIssue,
  acquisitionPreview,
  toAcquisitionInput,
} from '../../apps/admin/src/features/fleet/lib/acquisition-presentation';
import {
  ECONOMICS_COLUMN_KEYS,
  asOfIssue,
  breakEvenLabel,
  breakEvenTone,
  defaultAsOf,
  economicsCardCells,
  economicsRowCells,
  economicsTotalCards,
  sortedEconomicsRows,
} from '../../apps/admin/src/features/reporting/lib/economics-presentation';
import { formatCurrency } from '../../apps/admin/src/shared/i18n/locale';

const vnd = (value: number) => formatCurrency(value, 'vi');
const KEY = '00000000-0000-4000-8000-000000000401';

const EXPENSE: Expense = {
  amountVnd: 250_000,
  category: 'MAINTENANCE',
  createdAt: '2026-09-10T03:00:00.000Z',
  description: 'Thay nhớt',
  id: 'expense-1',
  method: 'CASH',
  notes: '',
  paidOn: '2026-09-10',
  recordedById: 'demo-staff',
  recordedByName: 'Nhân viên',
  reference: '',
  reversalOfId: null,
  reversedByExpenseId: null,
  vehicleCode: 'XE-001',
  vehicleId: 'vehicle-001',
};

const ACQUISITION = {
  purchasePriceVnd: 30_000_000,
  purchasedOn: '2026-01-15',
  salvageValueVnd: 3_000_000,
  updatedAt: '2026-09-10T03:00:00.000Z',
  updatedById: 'demo-owner',
  usefulLifeMonths: 36,
  vehicleId: 'vehicle-001',
};

const ROW: FleetEconomicsRow = {
  accumulatedDepreciationVnd: 6_000_000,
  acquisition: ACQUISITION,
  bookValueVnd: 24_000_000,
  breakEven: { monthsRemaining: 20, projectedOn: '2028-05-18', status: 'PROJECTED' },
  code: 'XE-001',
  expensesVnd: 250_000,
  model: 'Vision',
  monthlyDepreciationVnd: 750_000,
  netVnd: 310_000,
  plate: '59X1-000.01',
  purchasePriceVnd: 30_000_000,
  recoveredPercent: 1,
  rentalDays: 4,
  revenueVnd: 560_000,
  status: 'AVAILABLE',
  trailingNetVnd: 310_000,
  typeCode: 'XE_SO',
  vehicleId: 'vehicle-001',
};

const TOTALS: FleetEconomicsTotals = {
  accumulatedDepreciationVnd: 6_000_000,
  bookValueVnd: 24_000_000,
  expensesVnd: 5_250_000,
  netVnd: -4_660_000,
  purchasePriceVnd: 30_000_000,
  rentalDays: 4,
  revenueVnd: 590_000,
  unallocatedExpensesVnd: 5_000_000,
  unallocatedRevenueVnd: 30_000,
  vehicleCount: 3,
  vehiclesRecovered: 0,
};

const t = (key: string, options?: Record<string, unknown>) =>
  options ? `${key}:${Object.values(options).join('/')}` : key;

describe('Feature: Expense ledger — form, filters and row presentation', () => {
  it('defaults the paid day to the business day and mirrors the schema in blocked()', () => {
    const form = initialExpenseForm(new Date('2026-09-10T17:30:00.000Z'));
    expect(form.paidOn).toBe('2026-09-11');
    expect(expenseBlocked(form)).toBe(true);
    expect(expenseBlocked({ ...form, amount: '250000', description: 'Th' })).toBe(true);
    expect(expenseBlocked({ ...form, amount: '0', description: 'Thay nhớt' })).toBe(true);
    expect(expenseBlocked({ ...form, amount: '250000', description: 'Thay nhớt' })).toBe(false);
    expect(
      expenseBlocked({ ...form, amount: '250000', description: 'Thay nhớt', paidOn: '2026-9' }),
    ).toBe(true);
  });

  it('builds the API payload with a null vehicle when none is chosen', () => {
    const form = {
      ...initialExpenseForm(new Date('2026-09-10T03:00:00.000Z')),
      amount: '250000',
      description: ' Thay nhớt ',
      reference: ' HD-1 ',
    };
    expect(toExpenseInput(form, KEY)).toEqual({
      amountVnd: 250_000,
      category: 'MAINTENANCE',
      description: 'Thay nhớt',
      idempotencyKey: KEY,
      method: 'CASH',
      notes: '',
      paidOn: '2026-09-10',
      reference: 'HD-1',
      vehicleId: null,
    });
    expect(toExpenseInput({ ...form, vehicleId: 'vehicle-001' }, KEY).vehicleId).toBe(
      'vehicle-001',
    );
  });

  it('only forwards well-formed filters to the API', () => {
    expect(
      expenseQueryFrom({ category: 'FUEL', from: '2026-09-0', to: '2026-09-12', vehicleId: '' }),
    ).toEqual({ category: 'FUEL', limit: 200, to: '2026-09-12' });
    expect(expenseQueryFrom({ category: '', from: '', to: '', vehicleId: 'vehicle-001' })).toEqual({
      limit: 200,
      vehicleId: 'vehicle-001',
    });
  });

  it('derives the ledger status, the signed amount and who may reverse (BR-09)', () => {
    const reversed = { ...EXPENSE, reversedByExpenseId: 'expense-2' };
    const reversal = { ...EXPENSE, id: 'expense-2', reversalOfId: 'expense-1' };
    expect(expenseStatus(EXPENSE)).toBe('ORIGINAL');
    expect(expenseStatus(reversed)).toBe('REVERSED');
    expect(expenseStatus(reversal)).toBe('REVERSAL');
    expect(signedExpenseAmount(EXPENSE, 'vi')).toBe(vnd(250_000));
    expect(signedExpenseAmount(reversal, 'vi')).toBe(`−${vnd(250_000)}`);
    expect(expenseReversible(EXPENSE, 'OWNER')).toBe(true);
    expect(expenseReversible(EXPENSE, 'STAFF')).toBe(false);
    expect(expenseReversible(reversed, 'OWNER')).toBe(false);
    expect(expenseReversible(reversal, 'OWNER')).toBe(false);
    expect(formatPaidOn('2026-09-10', 'vi')).toBe('10/09/2026');
  });

  it('lists vehicles as select options behind the empty choice', () => {
    const vehicle = { code: 'XE-001', id: 'vehicle-001', plate: '59X1-000.01' };
    expect(vehicleOptions([vehicle as never], 'Mọi xe')).toEqual([
      { label: 'Mọi xe', value: '' },
      { label: 'XE-001 · 59X1-000.01', value: 'vehicle-001' },
    ]);
  });
});

describe('Feature: Vehicle cost basis — form, validation and depreciation preview', () => {
  it('starts from the stored cost or from the 36-month default', () => {
    expect(acquisitionFormFrom(null)).toEqual(INITIAL_ACQUISITION_FORM);
    expect(acquisitionFormFrom(ACQUISITION)).toEqual({
      purchasePrice: '30000000',
      purchasedOn: '2026-01-15',
      salvageValue: '3000000',
      usefulLifeMonths: '36',
    });
    expect(toAcquisitionInput(acquisitionFormFrom(ACQUISITION))).toEqual({
      purchasePriceVnd: 30_000_000,
      purchasedOn: '2026-01-15',
      salvageValueVnd: 3_000_000,
      usefulLifeMonths: 36,
    });
  });

  it('mirrors the schema: incomplete fields, then the salvage rule (BR-10)', () => {
    const form = acquisitionFormFrom(ACQUISITION);
    expect(acquisitionIssue(form)).toBeNull();
    expect(acquisitionIssue(INITIAL_ACQUISITION_FORM)).toBe('incomplete');
    expect(acquisitionIssue({ ...form, usefulLifeMonths: '0' })).toBe('incomplete');
    expect(acquisitionIssue({ ...form, usefulLifeMonths: '241' })).toBe('incomplete');
    expect(acquisitionIssue({ ...form, purchasedOn: '2026-1' })).toBe('incomplete');
    expect(acquisitionIssue({ ...form, salvageValue: '30000001' })).toBe('salvage');
    expect(acquisitionIssue({ ...form, purchasePrice: '0', salvageValue: '0' })).toBeNull();
  });

  it('previews the same depreciation figures the report uses', () => {
    const form = acquisitionFormFrom(ACQUISITION);
    expect(acquisitionPreview(form, new Date('2026-09-18T03:00:00.000Z'), 'vi')).toEqual([
      { key: 'monthly', value: vnd(750_000) },
      { key: 'accumulated', value: vnd(6_000_000) },
      { key: 'bookValue', value: vnd(24_000_000) },
      { key: 'months', value: '8' },
    ]);
    expect(acquisitionPreview(INITIAL_ACQUISITION_FORM, new Date(), 'vi')).toBeNull();
  });
});

describe('Feature: Fleet economics page — as-of day, badges, rows and totals', () => {
  it('defaults to today in the business time zone and rejects malformed days', () => {
    expect(defaultAsOf(new Date('2026-09-18T17:30:00.000Z'))).toBe('2026-09-19');
    expect(asOfIssue('2026-09-18')).toBeNull();
    expect(asOfIssue('2026-13-40')).toBe('invalid');
    expect(asOfIssue('')).toBe('invalid');
  });

  it('maps break-even statuses to tones and labels', () => {
    expect(breakEvenTone('RECOVERED')).toBe('success');
    expect(breakEvenTone('PROJECTED')).toBe('info');
    expect(breakEvenTone('NOT_PROJECTABLE')).toBe('warning');
    expect(breakEvenTone('NO_COST')).toBe('neutral');
    expect(breakEvenLabel(ROW.breakEven, 'vi', t)).toBe('breakEven.PROJECTED:18/05/2028/20');
    expect(
      breakEvenLabel({ monthsRemaining: 0, projectedOn: null, status: 'RECOVERED' }, 'vi', t),
    ).toBe('breakEven.RECOVERED');
  });

  it('renders the row in the approved column order with dashes when no cost basis exists', () => {
    const cells = economicsRowCells(ROW, 'vi', 'badge');
    expect(cells.map((cell) => cell.key)).toEqual([...ECONOMICS_COLUMN_KEYS]);
    expect(cells.map((cell) => cell.value)).toEqual([
      'XE-001 · 59X1-000.01',
      vnd(30_000_000),
      vnd(750_000),
      vnd(24_000_000),
      vnd(560_000),
      '4',
      vnd(250_000),
      vnd(310_000),
      '1%',
      'badge',
    ]);
    const bare = economicsRowCells({ ...ROW, acquisition: null, purchasePriceVnd: 0 }, 'vi', '');
    expect(bare[1]?.value).toBe('—');
    expect(bare[8]?.value).toBe('—');
    expect(economicsCardCells(ROW, 'vi').map((cell) => cell.key)).not.toContain('vehicle');
    expect(economicsCardCells(ROW, 'vi').map((cell) => cell.key)).not.toContain('breakEven');
  });

  it('builds the four KPI cards with the unallocated buckets as context', () => {
    expect(economicsTotalCards(TOTALS, 'vi')).toEqual([
      {
        contextKey: 'economicsKpiUnallocated',
        contextParams: { amount: vnd(30_000) },
        key: 'revenueVnd',
        value: vnd(590_000),
      },
      {
        contextKey: 'economicsKpiUnallocated',
        contextParams: { amount: vnd(5_000_000) },
        key: 'expensesVnd',
        value: vnd(5_250_000),
      },
      {
        contextKey: 'economicsKpi.netVnd',
        contextParams: {},
        key: 'netVnd',
        value: vnd(-4_660_000),
      },
      {
        contextKey: 'economicsKpiCount',
        contextParams: { count: 3, recovered: 0 },
        key: 'bookValueVnd',
        value: vnd(24_000_000),
      },
    ]);
  });

  it('sorts vehicles with a cost basis first and then by net descending', () => {
    const bare = { ...ROW, acquisition: null, code: 'XE-000', netVnd: 9_999_999 };
    const richer = { ...ROW, code: 'XE-002', netVnd: 400_000 };
    expect(sortedEconomicsRows([bare, ROW, richer]).map((row) => row.code)).toEqual([
      'XE-002',
      'XE-001',
      'XE-000',
    ]);
  });
});
