import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../../apps/api/src/database/prisma.service';
import { mapLine } from '../../apps/api/src/modules/contracts/prisma-contract.mapper';
import { PrismaContractRepository } from '../../apps/api/src/modules/contracts/prisma-contract.repository';

const CREATED_AT = new Date('2026-09-01T00:00:00.000Z');
const RETURNED_AT = new Date('2026-09-02T10:30:00.000Z');
const SETTLED_AT = new Date('2026-09-02T11:00:00.000Z');
const PRICING = {
  createdAt: CREATED_AT,
  createdById: 'owner-1',
  id: 'pricing-1',
  lateReturnGraceMinutes: 60,
  lateReturnHourlyRateVnd: 20_000,
  tiers: [],
  typeCode: 'SCOOTER',
  version: 1,
};
const LINE = {
  adjustmentPercent: 0,
  baseSubtotalVnd: 150_000,
  billableDays: 1,
  blocksAvailability: true,
  contractId: 'contract-1',
  dailyRateVnd: 150_000,
  endAt: new Date('2026-09-02T08:00:00.000Z'),
  explanation: '1 day',
  finalSubtotalVnd: 150_000,
  id: 'line-1',
  lateReturnGraceMinutes: 60,
  lateReturnHourlyRateVnd: 20_000,
  overrideReason: null,
  pricingVersion: PRICING,
  pricingVersionId: PRICING.id,
  replacedBy: null,
  replacesLineId: null,
  returnCondition: null,
  returnFuelPercent: null,
  returnImageObjectKeys: [],
  returnNotes: null,
  returnedAt: null,
  returnedById: null,
  startAt: new Date('2026-09-01T08:00:00.000Z'),
  vehicle: { code: 'XE-001' },
  vehicleId: 'vehicle-001',
};
const RETURNED_LINE = {
  ...LINE,
  blocksAvailability: false,
  returnCondition: 'GOOD',
  returnFuelPercent: 60,
  returnImageObjectKeys: ['private/returns/a.jpg'],
  returnNotes: 'Xe sạch',
  returnedAt: RETURNED_AT,
  returnedById: 'staff-1',
};
const LATE_CHARGE = {
  actorId: 'staff-1',
  amountVnd: 40_000,
  contractId: 'contract-1',
  createdAt: RETURNED_AT,
  description: 'Trả trễ 150 phút · 2 giờ tính phí',
  id: 'charge-1',
  kind: 'LATE_RETURN',
  lineId: 'line-1',
  metadata: {},
  vehicleCode: 'XE-001',
};
const SETTLEMENT_DRAFT = {
  chargesVnd: 190_000,
  depositAppliedVnd: 190_000,
  depositRefunded: true,
  depositVnd: 500_000,
  discountsVnd: 0,
  documentReturned: true,
  notes: '',
  outstandingVnd: 190_000,
  paidVnd: 0,
  receivableVnd: 0,
  refundVnd: 310_000,
  settledAt: SETTLED_AT,
  settledById: 'staff-1',
  totalDueVnd: 190_000,
};
const SETTLEMENT = { ...SETTLEMENT_DRAFT, contractId: 'contract-1', id: 'settlement-1' };
const CONTRACT = {
  activatedAt: CREATED_AT,
  cancellationReason: null,
  cancelledAt: null,
  cancelledById: null,
  charges: [LATE_CHARGE],
  code: 'HD-2026-TEST',
  completedAt: RETURNED_AT,
  createdAt: CREATED_AT,
  createdById: 'staff-1',
  customerId: 'customer-1',
  customerNameSnapshot: 'Test Customer',
  deliveryFeeVnd: 0,
  events: [],
  handover: null,
  id: 'contract-1',
  idempotencyKey: '00000000-0000-4000-8000-000000000002',
  lines: [RETURNED_LINE],
  overdueSince: null,
  settledAt: null,
  settlement: null,
  status: 'COMPLETED',
  totalVnd: 150_000,
};
const INSPECTION = {
  actualReturnAt: RETURNED_AT.toISOString(),
  condition: 'GOOD' as const,
  fuelPercent: 60,
  imageObjectKeys: ['private/returns/a.jpg'],
  lateFeeVnd: 40_000,
  notes: 'Xe sạch',
  returnedById: 'staff-1',
};
const RETURN_EVENT = {
  actorId: 'staff-1',
  occurredAt: RETURNED_AT.toISOString(),
  type: 'LINE_RETURNED' as const,
};

function transactionClient(record = CONTRACT) {
  return {
    contract: { update: vi.fn().mockResolvedValue(record) },
    contractCharge: { createMany: vi.fn().mockResolvedValue({ count: 1 }) },
    contractVehicleLine: { update: vi.fn().mockResolvedValue(RETURNED_LINE) },
  };
}

function repositoryWith(transaction: ReturnType<typeof transactionClient>) {
  const prisma = { $transaction: vi.fn((callback) => callback(transaction)) };
  return { prisma, repository: new PrismaContractRepository(prisma as unknown as PrismaService) };
}

describe('Feature: Sprint 5 Prisma production adapters', () => {
  it('writes the inspection, the late fee and the completion in one serializable transaction', async () => {
    const transaction = transactionClient();
    const { prisma, repository } = repositoryWith(transaction);
    const contract = await repository.returnLine(
      'contract-1',
      {
        charges: [{ ...LATE_CHARGE, contractId: undefined, createdAt: undefined, id: undefined }],
        completedAt: RETURNED_AT.toISOString(),
        inspection: INSPECTION,
        lineId: 'line-1',
      },
      [RETURN_EVENT, { ...RETURN_EVENT, type: 'COMPLETED' }],
    );
    expect(transaction.contractVehicleLine.update).toHaveBeenCalledWith({
      data: {
        blocksAvailability: false,
        returnCondition: 'GOOD',
        returnFuelPercent: 60,
        returnImageObjectKeys: ['private/returns/a.jpg'],
        returnNotes: 'Xe sạch',
        returnedAt: RETURNED_AT,
        returnedById: 'staff-1',
      },
      where: { id: 'line-1' },
    });
    expect(transaction.contractCharge.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          actorId: 'staff-1',
          amountVnd: 40_000,
          contractId: 'contract-1',
          kind: 'LATE_RETURN',
        }),
      ],
    });
    expect(transaction.contract.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          completedAt: RETURNED_AT,
          events: {
            create: [
              expect.objectContaining({ type: 'LINE_RETURNED' }),
              expect.objectContaining({ type: 'COMPLETED' }),
            ],
          },
          status: 'COMPLETED',
        }),
        where: { id: 'contract-1' },
      }),
    );
    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: 'Serializable',
    });
    expect(contract.status).toBe('COMPLETED');
    expect(contract.quote.lines[0]?.inspection).toEqual({
      actualReturnAt: RETURNED_AT.toISOString(),
      condition: 'GOOD',
      fuelPercent: 60,
      imageCount: 1,
      lateFeeVnd: 40_000,
      notes: 'Xe sạch',
      returnedById: 'staff-1',
    });
    expect(contract.charges[0]).toMatchObject({ amountVnd: 40_000, kind: 'LATE_RETURN' });
  });

  it('skips the charge batch and the completion for a partial on-time return', async () => {
    const transaction = transactionClient({ ...CONTRACT, completedAt: null, status: 'ACTIVE' });
    const { repository } = repositoryWith(transaction);
    await repository.returnLine(
      'contract-1',
      { charges: [], completedAt: null, inspection: INSPECTION, lineId: 'line-1' },
      [RETURN_EVENT],
    );
    expect(transaction.contractCharge.createMany).not.toHaveBeenCalled();
    const [call] = transaction.contract.update.mock.calls[0] as [{ data: object }];
    expect(call.data).not.toHaveProperty('status');
    expect(call.data).not.toHaveProperty('completedAt');
  });

  it('appends manual charges and freezes the settlement on the contract row', async () => {
    const transaction = transactionClient({
      ...CONTRACT,
      settledAt: SETTLED_AT,
      settlement: SETTLEMENT,
    });
    const { repository } = repositoryWith(transaction);
    await repository.addCharge(
      'contract-1',
      {
        amountVnd: 100_000,
        description: 'Trầy yếm',
        kind: 'DAMAGE',
        lineId: null,
        vehicleCode: null,
      },
      { ...RETURN_EVENT, reason: 'Trầy yếm', type: 'CHARGE_ADDED' },
    );
    expect(transaction.contract.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          charges: {
            create: expect.objectContaining({
              actorId: 'staff-1',
              amountVnd: 100_000,
              metadata: {},
            }),
          },
          events: { create: expect.objectContaining({ reason: 'Trầy yếm', type: 'CHARGE_ADDED' }) },
        },
      }),
    );
    const settled = await repository.settle(
      'contract-1',
      { ...SETTLEMENT_DRAFT, settledAt: SETTLED_AT.toISOString() },
      { ...RETURN_EVENT, type: 'SETTLED' },
    );
    expect(transaction.contract.update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          settledAt: SETTLED_AT,
          settlement: {
            create: expect.objectContaining({ refundVnd: 310_000, settledAt: SETTLED_AT }),
          },
        }),
      }),
    );
    expect(settled.settledAt).toBe(SETTLED_AT.toISOString());
    expect(settled.settlement).toMatchObject({ id: 'settlement-1', refundVnd: 310_000 });
  });

  it('maps inspections only for returned lines and falls back safely', () => {
    expect(mapLine(LINE).inspection).toBeNull();
    expect(mapLine({ ...RETURNED_LINE, returnedById: null }, []).inspection).toMatchObject({
      lateFeeVnd: 0,
      returnedById: 'system',
    });
    expect(mapLine(RETURNED_LINE, [LATE_CHARGE]).inspection).toMatchObject({ lateFeeVnd: 40_000 });
  });
});
