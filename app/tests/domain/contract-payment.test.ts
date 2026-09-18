import { netPaid, paymentBalance, paymentCap, remainingReceivable } from '@rental/contracts';
import { describe, expect, it } from 'vitest';
import {
  PAYABLE_CONTRACT_STATUSES,
  contractBalance,
  contractPaymentCap,
  lastPaymentAt,
  paymentAllowed,
} from '../../apps/api/src/modules/contracts/contract-payment.policy';
import {
  agingBucket,
  businessDaysBetween,
  receivableAging,
  receivableItem,
  receivableList,
} from '../../apps/api/src/modules/finance/receivable.policy';
import { contractFixture, paymentFixture, settlementFixture } from './support/contract-fixture';

const NOW = new Date('2026-09-10T03:00:00.000Z');
const CASH = paymentFixture({
  amountVnd: 100_000,
  id: 'pay-cash',
  receivedAt: '2026-10-06T09:00:00.000Z',
});
const TRANSFER = paymentFixture({
  amountVnd: 50_000,
  id: 'pay-transfer',
  method: 'BANK_TRANSFER',
  receivedAt: '2026-10-06T10:00:00.000Z',
});
const REFUND = paymentFixture({
  amountVnd: 30_000,
  id: 'pay-refund',
  kind: 'REFUND',
  receivedAt: '2026-10-07T01:00:00.000Z',
});

const overdue = contractFixture({
  code: 'HD-ACTIVE',
  endAt: '2026-09-02T08:00:00.000Z',
  startAt: '2026-09-01T08:00:00.000Z',
  status: 'OVERDUE',
});
const completed = contractFixture({
  code: 'HD-DONE',
  completedAt: '2026-08-20T08:00:00.000Z',
  endAt: '2026-08-19T08:00:00.000Z',
  payments: [CASH],
  startAt: '2026-08-18T08:00:00.000Z',
  status: 'COMPLETED',
});

describe('Feature: Payment ledger — shared balance math (BR-04)', () => {
  it('nets refunds against receipts and never goes negative', () => {
    expect(netPaid([CASH, TRANSFER, REFUND])).toBe(120_000);
    expect(netPaid([REFUND])).toBe(0);
    expect(netPaid([])).toBe(0);
  });

  it('caps a collection at the outstanding amount and a refund at the net collected', () => {
    const source = { payments: [CASH, REFUND], settlement: null, totalDueVnd: 150_000 };
    expect(remainingReceivable(source)).toBe(80_000);
    expect(paymentCap(source, 'PAYMENT')).toBe(80_000);
    expect(paymentCap(source, 'REFUND')).toBe(70_000);
    expect(paymentBalance(source)).toEqual({
      cashVnd: 100_000,
      depositRefundedVnd: 0,
      paidVnd: 70_000,
      refundedVnd: 30_000,
      remainingVnd: 80_000,
      totalDueVnd: 150_000,
      transferVnd: 0,
    });
  });

  it('shrinks the frozen settlement receivable by money collected afterwards (BR-07)', () => {
    const settlement = { paidVnd: 100_000, receivableVnd: 200_000 };
    const before = { payments: [CASH], settlement, totalDueVnd: 300_000 };
    expect(remainingReceivable(before)).toBe(200_000);
    expect(remainingReceivable({ ...before, payments: [CASH, TRANSFER] })).toBe(150_000);
    const cleared = [CASH, paymentFixture({ amountVnd: 250_000, id: 'pay-big' })];
    expect(remainingReceivable({ ...before, payments: cleared })).toBe(0);
    expect(paymentCap({ ...before, payments: cleared }, 'PAYMENT')).toBe(0);
  });
});

describe('Feature: Payment ledger — contract policy', () => {
  it('allows money on every status except cancelled', () => {
    expect(PAYABLE_CONTRACT_STATUSES).toEqual(['CONFIRMED', 'ACTIVE', 'OVERDUE', 'COMPLETED']);
    expect(paymentAllowed(contractFixture({ status: 'CANCELLED' }))).toBe(false);
    expect(paymentAllowed(contractFixture({ status: 'OVERDUE' }))).toBe(true);
    expect(paymentAllowed(contractFixture())).toBe(true);
  });

  it('derives the total due from the statement; the deposit only counts at settlement', () => {
    const contract = contractFixture({ depositVnd: 500_000, payments: [CASH] });
    expect(contractBalance(contract)).toMatchObject({
      paidVnd: 100_000,
      remainingVnd: 50_000,
      totalDueVnd: 150_000,
    });
    expect(contractPaymentCap(contract, 'PAYMENT')).toBe(50_000);
    expect(contractPaymentCap(contract, 'REFUND')).toBe(100_000);
  });

  it('uses the settlement snapshot once settled and reports the last receipt', () => {
    const settlement = settlementFixture({ paidVnd: 0, receivableVnd: 190_000 });
    const contract = contractFixture({
      payments: [TRANSFER, CASH],
      settlement,
      status: 'COMPLETED',
    });
    expect(contractBalance(contract).remainingVnd).toBe(40_000);
    expect(lastPaymentAt(contract)).toBe('2026-10-06T10:00:00.000Z');
    expect(lastPaymentAt(contractFixture())).toBeNull();
  });
});

describe('Feature: Receivables — who owes what and for how long', () => {
  it('counts whole business days in Asia/Ho_Chi_Minh', () => {
    expect(businessDaysBetween('2026-09-09T17:30:00.000Z', NOW)).toBe(0);
    expect(businessDaysBetween('2026-09-02T08:00:00.000Z', NOW)).toBe(8);
    expect(businessDaysBetween(NOW, '2026-09-02T08:00:00.000Z')).toBe(0);
  });

  it('lists only contracts whose rental ended with money still owed, oldest first', () => {
    const booked = contractFixture({ code: 'HD-BOOKED' });
    const paid = contractFixture({
      code: 'HD-PAID',
      endAt: '2026-09-01T08:00:00.000Z',
      payments: [paymentFixture({ amountVnd: 150_000 })],
      startAt: '2026-08-31T08:00:00.000Z',
      status: 'ACTIVE',
    });
    const cancelled = contractFixture({
      code: 'HD-CANCELLED',
      endAt: '2026-08-19T08:00:00.000Z',
      startAt: '2026-08-18T08:00:00.000Z',
      status: 'CANCELLED',
    });
    const list = receivableList([booked, overdue, paid, completed, cancelled], NOW);
    expect(list.items.map((item) => item.code)).toEqual(['HD-DONE', 'HD-ACTIVE']);
    expect(list.items[0]).toMatchObject({
      contractId: 'hd-done',
      customerName: 'Khách hàng mẫu',
      daysOutstanding: 21,
      dueAt: '2026-08-20T08:00:00.000Z',
      lastPaymentAt: CASH.receivedAt,
      paidVnd: 100_000,
      remainingVnd: 50_000,
      settledAt: null,
      status: 'COMPLETED',
      totalDueVnd: 150_000,
    });
    expect(list.items[1]).toMatchObject({
      daysOutstanding: 8,
      lastPaymentAt: null,
      remainingVnd: 150_000,
    });
    expect(list).toMatchObject({
      count: 2,
      generatedAt: NOW.toISOString(),
      overSevenDays: 2,
      timeZone: 'Asia/Ho_Chi_Minh',
      totalRemainingVnd: 200_000,
    });
    expect(receivableItem(booked, NOW)).toBeNull();
    expect(receivableItem(paid, NOW)).toBeNull();
  });

  it('buckets outstanding debt by age', () => {
    expect([0, 1, 7, 8, 30, 31].map(agingBucket)).toEqual([
      'CURRENT',
      'DAYS_1_7',
      'DAYS_1_7',
      'DAYS_8_30',
      'DAYS_8_30',
      'OVER_30',
    ]);
    const aging = receivableAging(receivableList([overdue, completed], NOW).items);
    expect(aging).toEqual({
      count: 2,
      rows: [
        { bucket: 'CURRENT', count: 0, totalVnd: 0 },
        { bucket: 'DAYS_1_7', count: 0, totalVnd: 0 },
        { bucket: 'DAYS_8_30', count: 2, totalVnd: 200_000 },
        { bucket: 'OVER_30', count: 0, totalVnd: 0 },
      ],
      totalVnd: 200_000,
    });
    expect(receivableAging([])).toEqual({
      count: 0,
      rows: expect.arrayContaining([{ bucket: 'OVER_30', count: 0, totalVnd: 0 }]),
      totalVnd: 0,
    });
  });
});
