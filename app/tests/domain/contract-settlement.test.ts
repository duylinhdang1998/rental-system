import { maxDepositApplied, settlementFigures } from '@rental/contracts';
import { describe, expect, it } from 'vitest';
import {
  CHARGEABLE_CONTRACT_STATUSES,
  buildStatement,
  chargeAllowed,
  statementItems,
  sumItems,
} from '../../apps/api/src/modules/contracts/contract-settlement.policy';
import {
  chargeFixture,
  contractFixture,
  contractLine,
  inspectionFixture,
  settlementFixture,
} from './support/contract-fixture';

describe('Feature: Settlement figures (BR-04 explicit money direction)', () => {
  it('applies the whole deposit when the customer still owes more than it', () => {
    const figures = settlementFigures({
      chargesVnd: 740_000,
      depositVnd: 500_000,
      discountsVnd: 0,
      paidVnd: 0,
    });
    expect(figures).toEqual({
      chargesVnd: 740_000,
      depositAppliedVnd: 500_000,
      depositVnd: 500_000,
      discountsVnd: 0,
      outstandingVnd: 740_000,
      paidVnd: 0,
      receivableVnd: 240_000,
      refundVnd: 0,
      totalDueVnd: 740_000,
    });
  });

  it('refunds the deposit remainder when charges are smaller than the deposit', () => {
    const figures = settlementFigures({
      chargesVnd: 340_000,
      depositVnd: 500_000,
      discountsVnd: 0,
      paidVnd: 0,
    });
    expect(figures).toMatchObject({
      depositAppliedVnd: 340_000,
      receivableVnd: 0,
      refundVnd: 160_000,
      totalDueVnd: 340_000,
    });
  });

  it('subtracts discounts and payments before touching the deposit', () => {
    const figures = settlementFigures({
      chargesVnd: 300_000,
      depositVnd: 100_000,
      discountsVnd: 50_000,
      paidVnd: 200_000,
    });
    expect(figures).toMatchObject({
      depositAppliedVnd: 50_000,
      outstandingVnd: 50_000,
      receivableVnd: 0,
      refundVnd: 50_000,
      totalDueVnd: 250_000,
    });
    expect(
      settlementFigures({ chargesVnd: 20_000, depositVnd: 0, discountsVnd: 50_000, paidVnd: 0 }),
    ).toMatchObject({ receivableVnd: 0, refundVnd: 0, totalDueVnd: 0 });
  });

  it('honours a smaller explicit deposit application and clamps a larger one', () => {
    const partial = settlementFigures({
      chargesVnd: 340_000,
      depositAppliedVnd: 100_000,
      depositVnd: 500_000,
      discountsVnd: 0,
      paidVnd: 0,
    });
    expect(partial).toMatchObject({
      depositAppliedVnd: 100_000,
      receivableVnd: 240_000,
      refundVnd: 400_000,
    });
    const clamped = settlementFigures({
      chargesVnd: 340_000,
      depositAppliedVnd: 900_000,
      depositVnd: 500_000,
      discountsVnd: 0,
      paidVnd: 0,
    });
    expect(clamped).toMatchObject({ depositAppliedVnd: 340_000, refundVnd: 160_000 });
    expect(maxDepositApplied(500_000, 340_000)).toBe(340_000);
    expect(maxDepositApplied(500_000, 740_000)).toBe(500_000);
  });
});

describe('Feature: Settlement statement', () => {
  const lines = [
    contractLine({ id: 'old', replacedByLineId: 'line-1', vehicleCode: 'XE-009' }),
    contractLine({
      finalSubtotalVnd: 300_000,
      inspection: inspectionFixture({ lateFeeVnd: 40_000 }),
    }),
    contractLine({ id: 'line-2', vehicleCode: 'XE-002', vehicleId: 'vehicle-002' }),
  ];
  const charges = [
    chargeFixture(),
    chargeFixture({
      amountVnd: 20_000,
      id: 'charge-2',
      kind: 'DISCOUNT',
      lineId: null,
      vehicleCode: null,
    }),
  ];

  it('lists rentals of the resolved swap chain, the delivery fee and every charge in order', () => {
    const contract = contractFixture({ charges, deliveryFeeVnd: 30_000, lines, status: 'ACTIVE' });
    const items = statementItems(contract);
    expect(items.map((item) => [item.kind, item.amountVnd])).toEqual([
      ['RENTAL', 300_000],
      ['RENTAL', 150_000],
      ['DELIVERY_FEE', 30_000],
      ['LATE_RETURN', 40_000],
      ['DISCOUNT', 20_000],
    ]);
    expect(sumItems(items, false)).toBe(520_000);
    expect(sumItems(items, true)).toBe(20_000);
  });

  it('previews live figures while vehicles are still out and flags the open ones', () => {
    const contract = contractFixture({ charges, depositVnd: 500_000, lines, status: 'ACTIVE' });
    const statement = buildStatement(contract, { paidVnd: 0 });
    expect(statement).toMatchObject({
      contractId: contract.id,
      depositAppliedVnd: 470_000,
      openVehicleCodes: ['XE-002'],
      ready: false,
      refundVnd: 30_000,
      settledAt: null,
      totalDueVnd: 470_000,
    });
    expect(buildStatement(contract, { depositAppliedVnd: 100_000, paidVnd: 0 })).toMatchObject({
      depositAppliedVnd: 100_000,
      receivableVnd: 370_000,
    });
  });

  it('is ready once every vehicle is back and frozen after the settlement (BR-07)', () => {
    const returned = [
      contractLine({ inspection: inspectionFixture() }),
      contractLine({ id: 'line-2', inspection: inspectionFixture(), vehicleCode: 'XE-002' }),
    ];
    const completed = contractFixture({ lines: returned, status: 'COMPLETED' });
    expect(buildStatement(completed, { paidVnd: 0 })).toMatchObject({
      openVehicleCodes: [],
      ready: true,
    });
    const settlement = settlementFixture({ totalDueVnd: 999 });
    const settled = contractFixture({ lines: returned, settlement, status: 'COMPLETED' });
    expect(buildStatement(settled, { paidVnd: 0 })).toMatchObject({
      ready: false,
      refundVnd: 310_000,
      settledAt: settlement.settledAt,
      totalDueVnd: 999,
    });
  });

  it('allows charges while renting or completed until the settlement freezes the record', () => {
    expect(CHARGEABLE_CONTRACT_STATUSES).toEqual(['ACTIVE', 'OVERDUE', 'COMPLETED']);
    expect(chargeAllowed(contractFixture({ status: 'ACTIVE' }))).toBe(true);
    expect(chargeAllowed(contractFixture({ status: 'COMPLETED' }))).toBe(true);
    expect(chargeAllowed(contractFixture({ status: 'CONFIRMED' }))).toBe(false);
    expect(chargeAllowed(contractFixture({ status: 'CANCELLED' }))).toBe(false);
    expect(
      chargeAllowed(contractFixture({ settlement: settlementFixture(), status: 'COMPLETED' })),
    ).toBe(false);
  });
});
