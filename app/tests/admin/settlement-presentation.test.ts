import type { ContractEvent, SettlementStatement } from '@rental/contracts';
import { describe, expect, it } from 'vitest';
import { formatCurrency } from '../../apps/admin/src/shared/i18n/locale';
import {
  contractActions,
  describeEvent,
  isRentingStatus,
  lifecycleRows,
  openContractLines,
  showsSettlement,
  toLocalInput,
} from '../../apps/admin/src/features/contracts/lib/contract-presentation';
import {
  initialReturnForm,
  lateFeePreview,
  returnTargetFromLine,
  toReturnInput,
} from '../../apps/admin/src/features/contracts/lib/return-form';
import {
  chargeKinds,
  depositCap,
  figureRows,
  initialSettleForm,
  outcomeAmount,
  previewSettlement,
  settleBlocked,
  settlementOutcome,
  toChargeInput,
  toSettleInput,
} from '../../apps/admin/src/features/contracts/lib/settlement-presentation';
import {
  contractFixture,
  contractLine,
  inspectionFixture,
  settlementFixture,
} from '../domain/support/contract-fixture';

const vnd = (value: number) => formatCurrency(value, 'vi');

const STATEMENT: SettlementStatement = {
  chargesVnd: 340_000,
  contractId: 'hd-1',
  depositAppliedVnd: 340_000,
  depositVnd: 500_000,
  discountsVnd: 0,
  items: [],
  openVehicleCodes: [],
  outstandingVnd: 340_000,
  paidVnd: 0,
  ready: true,
  receivableVnd: 0,
  refundVnd: 160_000,
  settledAt: null,
  totalDueVnd: 340_000,
};

function event(overrides: Partial<ContractEvent>): ContractEvent {
  return {
    actorId: 'staff-1',
    id: 'event-1',
    metadata: {},
    occurredAt: '2026-10-06T08:00:00.000Z',
    reason: null,
    type: 'CREATED',
    ...overrides,
  };
}

describe('Feature: Contract actions after Sprint 5', () => {
  it('offers charges while renting, settlement once complete, nothing once settled', () => {
    expect(contractActions('ACTIVE')).toEqual(['extend', 'swap', 'charge']);
    expect(contractActions('COMPLETED')).toEqual(['settle', 'charge']);
    expect(contractActions('COMPLETED', true)).toEqual([]);
    expect(isRentingStatus('OVERDUE')).toBe(true);
    expect(isRentingStatus('COMPLETED')).toBe(false);
    expect(showsSettlement('COMPLETED')).toBe(true);
    expect(showsSettlement('CONFIRMED')).toBe(false);
  });

  it('keeps only lines whose vehicle is still out', () => {
    const lines = [
      contractLine({ id: 'old', replacedByLineId: 'line-1' }),
      contractLine({ inspection: inspectionFixture() }),
      contractLine({ id: 'line-2', vehicleCode: 'XE-002' }),
    ];
    expect(openContractLines(lines).map((line) => line.vehicleCode)).toEqual(['XE-002']);
  });

  it('describes return, charge and settlement events with explicit signs', () => {
    const charge = event({
      metadata: { amountVnd: 100_000, kind: 'DAMAGE', vehicleCode: 'XE-001' },
      reason: 'Trầy yếm',
      type: 'CHARGE_ADDED',
    });
    expect(describeEvent(charge, 'vi')).toBe(`XE-001 · +${vnd(100_000)} · Trầy yếm`);
    const discount = event({
      metadata: { amountVnd: 30_000, kind: 'DISCOUNT' },
      type: 'CHARGE_ADDED',
    });
    expect(describeEvent(discount, 'vi')).toBe(`−${vnd(30_000)}`);
    const returned = event({
      metadata: {
        actualReturnAt: '2026-10-06T10:30:00.000Z',
        lateFeeVnd: 40_000,
        vehicleCode: 'XE-001',
      },
      type: 'LINE_RETURNED',
    });
    expect(describeEvent(returned, 'vi')).toContain('XE-001 · ');
    expect(describeEvent(returned, 'vi')).toContain(`+${vnd(40_000)}`);
    expect(
      describeEvent(event({ metadata: { totalDueVnd: 340_000 }, type: 'SETTLED' }), 'vi'),
    ).toBe(vnd(340_000));
    const settled = contractFixture({ settlement: settlementFixture(), status: 'COMPLETED' });
    expect(lifecycleRows(settled, 'vi').map((row) => row.labelKey)).toEqual(['contractSettledAt']);
  });
});

describe('Feature: Return form', () => {
  it('builds the API input from the form and previews the late fee with the shared formula', () => {
    const now = new Date('2026-10-06T10:30:00.000Z');
    const form = initialReturnForm(now);
    expect(form).toMatchObject({ actualLocal: toLocalInput(now.toISOString()), condition: 'GOOD' });
    expect(toReturnInput(form)).toEqual({
      actualReturnAt: now.toISOString(),
      charges: [],
      condition: 'GOOD',
      fuelPercent: 50,
      imageObjectKeys: [],
      notes: '',
    });
    expect(
      toReturnInput({
        ...form,
        chargeAmount: '100000',
        chargeDescription: ' Trầy yếm ',
        notes: ' ok ',
      }),
    ).toMatchObject({
      charges: [{ amountVnd: 100_000, description: 'Trầy yếm', kind: 'DAMAGE' }],
      notes: 'ok',
    });
    const target = returnTargetFromLine(contractLine());
    expect(target).toEqual({
      endAt: '2026-10-06T08:00:00.000Z',
      id: 'line-1',
      lateReturnPolicy: { graceMinutes: 60, hourlyRateVnd: 20_000 },
      vehicleCode: 'XE-001',
    });
    expect(lateFeePreview(target, form.actualLocal)).toMatchObject({
      billableLateHours: 2,
      feeVnd: 40_000,
    });
    expect(lateFeePreview(target, 'not-a-date')).toBeNull();
  });
});

describe('Feature: Settlement presentation', () => {
  it('names the money direction and lists figure rows with discounts only when present', () => {
    expect(settlementOutcome({ receivableVnd: 240_000, refundVnd: 0 })).toBe('receivable');
    expect(settlementOutcome({ receivableVnd: 0, refundVnd: 160_000 })).toBe('refund');
    expect(settlementOutcome({ receivableVnd: 0, refundVnd: 0 })).toBe('zero');
    expect(outcomeAmount(STATEMENT)).toBe(160_000);
    expect(outcomeAmount({ ...STATEMENT, receivableVnd: 240_000, refundVnd: 0 })).toBe(240_000);
    expect(outcomeAmount({ ...STATEMENT, refundVnd: 0 })).toBe(0);
    const rows = figureRows(STATEMENT, 'vi');
    expect(rows.map((row) => row.labelKey)).toEqual([
      'settlementCharges',
      'settlementTotalDue',
      'settlementPaid',
      'settlementDeposit',
      'settlementDepositApplied',
      'settlementReceivable',
      'settlementRefund',
    ]);
    expect(rows.find((row) => row.labelKey === 'settlementRefund')).toMatchObject({
      emphasis: true,
      value: vnd(160_000),
    });
    const discounted = figureRows({ ...STATEMENT, discountsVnd: 20_000 }, 'vi');
    expect(discounted[1]).toEqual({
      emphasis: false,
      labelKey: 'settlementDiscounts',
      value: `−${vnd(20_000)}`,
    });
  });

  it('previews deposit changes locally, mirrors the checklist and builds the settle input', () => {
    const form = initialSettleForm(STATEMENT);
    expect(form).toEqual({
      depositApplied: '340000',
      depositRefunded: false,
      documentReturned: false,
      notes: '',
    });
    const preview = previewSettlement(STATEMENT, '100000');
    expect(preview).toMatchObject({
      depositAppliedVnd: 100_000,
      receivableVnd: 240_000,
      refundVnd: 400_000,
    });
    expect(depositCap(preview)).toBe(340_000);
    expect(settleBlocked(form, preview, 'CCCD')).toBe(true);
    expect(settleBlocked({ ...form, documentReturned: true }, preview, 'CCCD')).toBe(true);
    expect(
      settleBlocked({ ...form, depositRefunded: true, documentReturned: true }, preview, 'CCCD'),
    ).toBe(false);
    expect(settleBlocked(form, { ...preview, refundVnd: 0 }, '')).toBe(false);
    expect(toSettleInput({ ...form, depositApplied: '', notes: ' xong ' })).toEqual({
      depositRefunded: false,
      documentReturned: false,
      notes: 'xong',
    });
    expect(toSettleInput({ ...form, depositApplied: '100000' })).toMatchObject({
      depositAppliedVnd: 100_000,
    });
  });

  it('limits discounts to the Owner and omits the line when charging the whole contract', () => {
    expect(chargeKinds(true)).toEqual(['DAMAGE', 'OTHER', 'DISCOUNT']);
    expect(chargeKinds(false)).toEqual(['DAMAGE', 'OTHER']);
    const form = {
      amount: '100000',
      description: ' Trầy yếm ',
      kind: 'DAMAGE' as const,
      lineId: '',
    };
    expect(toChargeInput(form)).toEqual({
      amountVnd: 100_000,
      description: 'Trầy yếm',
      kind: 'DAMAGE',
    });
    expect(toChargeInput({ ...form, amount: '', lineId: 'line-1' })).toMatchObject({
      amountVnd: 0,
      lineId: 'line-1',
    });
  });
});
