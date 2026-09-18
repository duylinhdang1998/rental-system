import type { CashShiftExpectation } from '@rental/contracts';
import { describe, expect, it } from 'vitest';
import {
  INITIAL_CLOSE_FORM,
  INITIAL_OPEN_FORM,
  closeBlocked,
  formatVariance,
  movementRows,
  openBlocked,
  previewVariance,
  toCloseInput,
  toOpenInput,
  varianceTone,
} from '../../apps/admin/src/features/cash-shifts/lib/cash-shift-presentation';
import { formatCurrency } from '../../apps/admin/src/shared/i18n/locale';

const vnd = (value: number) => formatCurrency(value, 'vi');

const EXPECTATION: CashShiftExpectation = {
  asOf: '2026-09-18T03:32:00.000Z',
  cashCollectedVnd: 300_000,
  cashExpensesVnd: 100_000,
  cashRefundedVnd: 50_000,
  depositRefundedVnd: 200_000,
  expectedCashVnd: 950_000,
  openingFloatVnd: 1_000_000,
};

describe('Feature: Cash shift presentation', () => {
  it('starts both forms empty', () => {
    expect(INITIAL_OPEN_FORM).toEqual({ openingFloatVnd: '' });
    expect(INITIAL_CLOSE_FORM).toEqual({ countedCashVnd: '', note: '' });
  });

  it('mirrors cashShiftOpenInputSchema in openBlocked and toOpenInput', () => {
    expect(openBlocked(INITIAL_OPEN_FORM)).toBe(true);
    expect(openBlocked({ openingFloatVnd: '-1' })).toBe(true);
    expect(openBlocked({ openingFloatVnd: '1000000001' })).toBe(true);
    expect(openBlocked({ openingFloatVnd: '1000000' })).toBe(false);
    expect(openBlocked({ openingFloatVnd: '0' })).toBe(false);
    expect(toOpenInput({ openingFloatVnd: '1000000' })).toEqual({ openingFloatVnd: 1_000_000 });
    expect(toOpenInput(INITIAL_OPEN_FORM)).toEqual({ openingFloatVnd: 0 });
  });

  it('trims the note and parses the counted amount in toCloseInput', () => {
    expect(toCloseInput({ countedCashVnd: '930000', note: '  Thiếu tiền lẻ  ' })).toEqual({
      countedCashVnd: 930_000,
      note: 'Thiếu tiền lẻ',
    });
    expect(toCloseInput(INITIAL_CLOSE_FORM)).toEqual({ countedCashVnd: 0, note: '' });
  });

  it('previews the variance only once the counted amount parses', () => {
    expect(previewVariance({ countedCashVnd: '', note: '' }, EXPECTATION)).toBeNull();
    expect(previewVariance({ countedCashVnd: '930000', note: '' }, EXPECTATION)).toBe(-20_000);
    expect(previewVariance({ countedCashVnd: '950000', note: '' }, EXPECTATION)).toBe(0);
    expect(previewVariance({ countedCashVnd: '970000', note: '' }, EXPECTATION)).toBe(20_000);
  });

  it('blocks the close button on an invalid amount or a missing note when off (BR-04)', () => {
    expect(closeBlocked({ countedCashVnd: '', note: '' }, EXPECTATION)).toBe(true);
    expect(closeBlocked({ countedCashVnd: '-1', note: '' }, EXPECTATION)).toBe(true);
    expect(closeBlocked({ countedCashVnd: '1000000001', note: '' }, EXPECTATION)).toBe(true);
    expect(closeBlocked({ countedCashVnd: '950000', note: '' }, EXPECTATION)).toBe(false);
    expect(closeBlocked({ countedCashVnd: '930000', note: '' }, EXPECTATION)).toBe(true);
    expect(closeBlocked({ countedCashVnd: '930000', note: 'Thiếu tiền lẻ' }, EXPECTATION)).toBe(
      false,
    );
  });

  it('builds the four movement chips in the order the expectedCash formula applies them', () => {
    expect(movementRows(EXPECTATION, 'vi')).toEqual([
      { labelKey: 'cashShiftCollected', signed: '+', value: vnd(300_000) },
      { labelKey: 'cashShiftRefunded', signed: '-', value: vnd(50_000) },
      { labelKey: 'cashShiftDepositRefunded', signed: '-', value: vnd(200_000) },
      { labelKey: 'cashShiftExpenses', signed: '-', value: vnd(100_000) },
    ]);
  });

  it('flips the expenses chip to a plus when a reversal makes the net figure negative', () => {
    const reversed = { ...EXPECTATION, cashExpensesVnd: -50_000 };
    expect(movementRows(reversed, 'vi')[3]).toEqual({
      labelKey: 'cashShiftExpenses',
      signed: '+',
      value: vnd(50_000),
    });
  });

  it('maps the variance to a tone: 0 matched, negative short, positive over', () => {
    expect(varianceTone(0)).toBe('success');
    expect(varianceTone(-20_000)).toBe('danger');
    expect(varianceTone(20_000)).toBe('caution');
  });

  it('formats the variance with an explicit sign, never a bare hyphen', () => {
    expect(formatVariance(0, 'vi')).toBe(vnd(0));
    expect(formatVariance(-20_000, 'vi')).toBe(`−${vnd(20_000)}`);
    expect(formatVariance(20_000, 'vi')).toBe(`+${vnd(20_000)}`);
  });
});
