import type { ContractLedger, PaymentBalance, ReceivableItem } from '@rental/contracts';
import { describe, expect, it } from 'vitest';
import {
  INITIAL_PAYMENT_FORM,
  balanceRows,
  ledgerOpenReceivable,
  paymentBlocked,
  paymentCapFor,
  paymentMethodLabel,
  signedAmount,
  toDepositRefundInput,
  toPaymentInput,
} from '../../apps/admin/src/features/contracts/lib/payment-presentation';
import {
  oldestOutstandingDays,
  receivableBalance,
  receivableTone,
} from '../../apps/admin/src/features/finance/lib/receivable-presentation';
import { formatCurrency } from '../../apps/admin/src/shared/i18n/locale';

const vnd = (value: number) => formatCurrency(value, 'vi');

const BALANCE: PaymentBalance = {
  cashVnd: 100_000,
  depositRefundedVnd: 0,
  paidVnd: 250_000,
  refundedVnd: 0,
  remainingVnd: 270_000,
  totalDueVnd: 520_000,
  transferVnd: 150_000,
};

const KEY = '00000000-0000-4000-8000-000000000201';

function receivable(overrides: Partial<ReceivableItem>): ReceivableItem {
  return {
    code: 'HD-2026-0001',
    contractId: 'hd-1',
    customerName: 'Khách hàng mẫu',
    daysOutstanding: 3,
    dueAt: '2026-09-02T01:00:00.000Z',
    lastPaymentAt: null,
    paidVnd: 250_000,
    remainingVnd: 270_000,
    settledAt: null,
    status: 'COMPLETED',
    totalDueVnd: 520_000,
    ...overrides,
  };
}

describe('Feature: Payment entry — caps and form', () => {
  it('caps a collection by the receivable and a refund by the net collected', () => {
    expect(paymentCapFor(BALANCE, 'PAYMENT')).toBe(270_000);
    expect(paymentCapFor(BALANCE, 'REFUND')).toBe(250_000);
    expect(paymentBlocked({ ...INITIAL_PAYMENT_FORM, amount: '270000' }, 270_000)).toBe(false);
    expect(paymentBlocked({ ...INITIAL_PAYMENT_FORM, amount: '270001' }, 270_000)).toBe(true);
    expect(paymentBlocked({ ...INITIAL_PAYMENT_FORM, amount: '0' }, 270_000)).toBe(true);
    expect(paymentBlocked(INITIAL_PAYMENT_FORM, 270_000)).toBe(true);
  });

  it('builds the API input with the dialog idempotency key and trimmed text', () => {
    expect(
      toPaymentInput(
        {
          amount: '100000',
          kind: 'PAYMENT',
          method: 'BANK_TRANSFER',
          notes: ' lần 1 ',
          reference: ' CK123 ',
        },
        KEY,
      ),
    ).toEqual({
      amountVnd: 100_000,
      idempotencyKey: KEY,
      kind: 'PAYMENT',
      method: 'BANK_TRANSFER',
      notes: 'lần 1',
      reference: 'CK123',
    });
    expect(toPaymentInput(INITIAL_PAYMENT_FORM, KEY)).toMatchObject({ amountVnd: 0 });
  });

  it('shows the money direction on every figure (BR-04)', () => {
    expect(signedAmount('PAYMENT', 100_000, 'vi')).toBe(`+${vnd(100_000)}`);
    expect(signedAmount('REFUND', 50_000, 'vi')).toBe(`−${vnd(50_000)}`);
    expect(signedAmount('DEPOSIT_REFUND', 160_000, 'vi')).toBe(`−${vnd(160_000)}`);
    expect(
      toDepositRefundInput({ method: 'CASH', notes: ' ok ', reference: ' PT1 ' }, KEY),
    ).toEqual({ idempotencyKey: KEY, method: 'CASH', notes: 'ok', reference: 'PT1' });
    expect(paymentMethodLabel('CASH', 'vi')).toBe('Tiền mặt');
    expect(paymentMethodLabel('BANK_TRANSFER', 'en')).toBe('Bank transfer');
    expect(paymentMethodLabel('CRYPTO', 'vi')).toBe('');
  });
});

describe('Feature: Ledger balance and receivables', () => {
  it('lists the balance rows and adds the refund line only when money went back', () => {
    expect(balanceRows(BALANCE, 'vi').map((row) => row.labelKey)).toEqual([
      'ledgerTotalDue',
      'ledgerCash',
      'ledgerTransfer',
      'ledgerPaid',
      'ledgerRemaining',
    ]);
    const refunded = balanceRows({ ...BALANCE, refundedVnd: 50_000 }, 'vi');
    expect(refunded[3]).toEqual({
      emphasis: false,
      labelKey: 'ledgerRefunded',
      value: `−${vnd(50_000)}`,
    });
    expect(refunded.at(-1)).toMatchObject({ emphasis: true, labelKey: 'ledgerRemaining' });
    const depositBack = balanceRows({ ...BALANCE, depositRefundedVnd: 160_000 }, 'vi');
    expect(depositBack.map((row) => row.labelKey)).toContain('ledgerDepositRefunded');
    expect(depositBack.find((row) => row.labelKey === 'ledgerDepositRefunded')).toMatchObject({
      value: `−${vnd(160_000)}`,
    });
    expect(balanceRows({ ...BALANCE, remainingVnd: 0 }, 'vi').at(-1)).toMatchObject({
      emphasis: false,
    });
  });

  it('keeps the payment action open after settlement while money is still owed', () => {
    const ledger = { balance: BALANCE } as ContractLedger;
    expect(ledgerOpenReceivable(ledger)).toBe(true);
    expect(
      ledgerOpenReceivable({ balance: { ...BALANCE, remainingVnd: 0 } } as ContractLedger),
    ).toBe(false);
    expect(ledgerOpenReceivable(undefined)).toBe(false);
  });

  it('tones receivables by age and hands the dialog only the two caps', () => {
    expect(receivableTone(0)).toBe('info');
    expect(receivableTone(7)).toBe('warning');
    expect(receivableTone(8)).toBe('danger');
    expect(oldestOutstandingDays([receivable({}), receivable({ daysOutstanding: 12 })])).toBe(12);
    expect(oldestOutstandingDays([])).toBe(0);
    expect(receivableBalance(receivable({}))).toEqual({ paidVnd: 250_000, remainingVnd: 270_000 });
  });
});
