import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../../apps/api/src/database/prisma.service';
import { PrismaContractRepository } from '../../apps/api/src/modules/contracts/prisma-contract.repository';
import { PrismaFleetRepository } from '../../apps/api/src/modules/fleet/prisma-fleet.repository';
import { PrismaPricingRepository } from '../../apps/api/src/modules/pricing/prisma-pricing.repository';

const CREATED_AT = new Date('2026-09-01T00:00:00.000Z');
const PRICING = {
  createdAt: CREATED_AT,
  createdById: 'owner-1',
  id: 'pricing-1',
  lateReturnGraceMinutes: 60,
  lateReturnHourlyRateVnd: 20_000,
  tiers: [
    {
      dailyRateVnd: 150_000,
      id: 'tier-1',
      maxDays: null,
      minDays: 1,
      pricingVersionId: 'pricing-1',
    },
  ],
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
  returnCondition: null,
  returnFuelPercent: null,
  returnImageObjectKeys: [],
  returnNotes: null,
  returnedAt: null,
  returnedById: null,
  pricingVersionId: PRICING.id,
  replacedBy: null,
  replacesLineId: null,
  startAt: new Date('2026-09-01T08:00:00.000Z'),
  vehicle: { code: 'XE-001' },
  vehicleId: 'vehicle-001',
};
const EVENT = {
  actorId: 'staff-1',
  contractId: 'contract-1',
  id: 'event-1',
  metadata: { reason: 'Khách đổi lịch' },
  occurredAt: CREATED_AT,
  reason: 'Khách đổi lịch',
  type: 'CANCELLED',
};
const CONTRACT = {
  activatedAt: null,
  cancellationReason: 'Khách đổi lịch',
  cancelledAt: CREATED_AT,
  cancelledById: 'staff-1',
  charges: [],
  code: 'HD-2026-TEST',
  completedAt: null,
  createdAt: CREATED_AT,
  createdById: 'staff-1',
  customerId: 'customer-1',
  customerNameSnapshot: 'Test Customer',
  deliveryFeeVnd: 0,
  events: [EVENT, { ...EVENT, id: 'event-2', metadata: 'broken', type: 'ACTIVATED' }],
  handover: null,
  id: 'contract-1',
  idempotencyKey: '00000000-0000-4000-8000-000000000001',
  lines: [
    { ...LINE, replacedBy: { id: 'line-2' } },
    {
      ...LINE,
      endAt: new Date('2026-09-03T08:00:00.000Z'),
      id: 'line-2',
      replacesLineId: 'line-1',
      startAt: new Date('2026-09-02T08:00:00.000Z'),
      vehicle: { code: 'XE-003' },
      vehicleId: 'vehicle-003',
    },
  ],
  overdueSince: null,
  settledAt: null,
  settlement: null,
  status: 'CANCELLED',
  totalVnd: 150_000,
};
const EVENT_INPUT = {
  actorId: 'staff-1',
  occurredAt: CREATED_AT.toISOString(),
  reason: 'Khách đổi lịch',
  type: 'CANCELLED' as const,
};

function transactionClient() {
  return {
    contract: { update: vi.fn().mockResolvedValue(CONTRACT) },
    contractVehicleLine: {
      create: vi.fn().mockResolvedValue(CONTRACT.lines[1]),
      update: vi.fn().mockResolvedValue(LINE),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
  };
}

describe('Feature: Sprint 4 Prisma production adapters', () => {
  it('applies lifecycle patches, releases holds and maps events and swap chains', async () => {
    const transaction = transactionClient();
    const prisma = { $transaction: vi.fn((callback) => callback(transaction)) };
    const repository = new PrismaContractRepository(prisma as unknown as PrismaService);
    const contract = await repository.applyLifecycle(
      'contract-1',
      { cancellationReason: 'Khách đổi lịch', cancelledById: 'staff-1', status: 'CANCELLED' },
      EVENT_INPUT,
    );
    expect(transaction.contractVehicleLine.updateMany).toHaveBeenCalledWith({
      data: { blocksAvailability: false },
      where: { contractId: 'contract-1' },
    });
    expect(transaction.contract.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          events: { create: expect.objectContaining({ type: 'CANCELLED' }) },
          status: 'CANCELLED',
        }),
      }),
    );
    expect(contract).toMatchObject({
      cancellationReason: 'Khách đổi lịch',
      cancelledAt: CREATED_AT.toISOString(),
      handover: { imageCount: 0 },
      quote: { endAt: '2026-09-03T08:00:00.000Z', startAt: '2026-09-01T08:00:00.000Z' },
      status: 'CANCELLED',
    });
    expect(contract.events).toEqual([
      expect.objectContaining({ metadata: { reason: 'Khách đổi lịch' }, type: 'CANCELLED' }),
      expect.objectContaining({ metadata: {}, type: 'ACTIVATED' }),
    ]);
    expect(contract.quote.lines[0]).toMatchObject({ replacedByLineId: 'line-2' });
    expect(contract.quote.lines[1]).toMatchObject({ replacesLineId: 'line-1' });
  });

  it('extends lines in one serializable transaction and drops manual overrides', async () => {
    const transaction = transactionClient();
    const prisma = { $transaction: vi.fn((callback) => callback(transaction)) };
    const repository = new PrismaContractRepository(prisma as unknown as PrismaService);
    await repository.extend(
      'contract-1',
      {
        endAt: '2026-09-04T08:00:00.000Z',
        lines: [
          {
            baseSubtotalVnd: 450_000,
            billableDays: 3,
            dailyRateVnd: 150_000,
            explanation: '3 ngày',
            finalSubtotalVnd: 450_000,
            id: 'line-1',
          },
        ],
        status: 'ACTIVE',
        totalVnd: 450_000,
      },
      { ...EVENT_INPUT, type: 'EXTENDED' },
    );
    expect(transaction.contractVehicleLine.update).toHaveBeenCalledWith({
      data: expect.objectContaining({
        billableDays: 3,
        endAt: new Date('2026-09-04T08:00:00.000Z'),
        id: undefined,
        overrideReason: null,
      }),
      where: { id: 'line-1' },
    });
    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: 'Serializable',
    });
  });

  it('swaps by truncating the old line and creating the linked replacement', async () => {
    const transaction = transactionClient();
    const prisma = { $transaction: vi.fn((callback) => callback(transaction)) };
    const repository = new PrismaContractRepository(prisma as unknown as PrismaService);
    await repository.swap(
      'contract-1',
      {
        closedLineId: 'line-1',
        replacement: {
          adjustmentPercent: 0,
          baseSubtotalVnd: 150_000,
          billableDays: 1,
          dailyRateVnd: 150_000,
          endAt: '2026-09-03T08:00:00.000Z',
          explanation: '1 day · thay cho XE-001',
          finalSubtotalVnd: 150_000,
          id: 'line-2',
          lateReturnPolicy: { graceMinutes: 60, hourlyRateVnd: 20_000 },
          pricingVersionId: 'pricing-1',
          pricingVersionNumber: 1,
          replacedByLineId: null,
          replacesLineId: 'line-1',
          startAt: '2026-09-02T08:00:00.000Z',
          vehicleCode: 'XE-003',
          vehicleId: 'vehicle-003',
        },
        swapAt: '2026-09-02T08:00:00.000Z',
      },
      { ...EVENT_INPUT, type: 'SWAPPED' },
    );
    expect(transaction.contractVehicleLine.update).toHaveBeenCalledWith({
      data: { endAt: new Date('2026-09-02T08:00:00.000Z') },
      where: { id: 'line-1' },
    });
    expect(transaction.contractVehicleLine.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        contractId: 'contract-1',
        id: 'line-2',
        replacesLineId: 'line-1',
        vehicleId: 'vehicle-003',
      }),
    });
  });

  it('lists, filters and derives vehicle holds from open contracts', async () => {
    const prisma = {
      contract: { findMany: vi.fn().mockResolvedValue([CONTRACT]) },
      contractVehicleLine: {
        findMany: vi
          .fn()
          .mockResolvedValue([
            { contract: { status: 'CONFIRMED' } },
            { contract: { status: 'ACTIVE' } },
          ]),
      },
    };
    const repository = new PrismaContractRepository(prisma as unknown as PrismaService);
    const items = await repository.list({ search: 'HD-2026', status: 'CANCELLED' });
    expect(items).toEqual([
      expect.objectContaining({
        code: 'HD-2026-TEST',
        status: 'CANCELLED',
        vehicleCodes: ['XE-003'],
      }),
    ]);
    expect(prisma.contract.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ OR: expect.any(Array), status: 'CANCELLED' }),
      }),
    );
    await expect(repository.listOpen()).resolves.toHaveLength(1);
    await expect(repository.vehicleHold('vehicle-001')).resolves.toBe('RENTED');
    expect(prisma.contractVehicleLine.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ blocksAvailability: true, replacedBy: null }),
      }),
    );
  });

  it('reads snapshotted pricing versions and single vehicles', async () => {
    const prisma = {
      pricingVersion: {
        findUnique: vi.fn().mockResolvedValueOnce(PRICING).mockResolvedValueOnce(null),
      },
      vehicle: {
        findUnique: vi.fn().mockResolvedValueOnce({
          code: 'XE-001',
          color: 'Trắng',
          createdAt: CREATED_AT,
          id: 'vehicle-001',
          model: 'Vision',
          plate: '43A1-000.01',
          status: 'AVAILABLE',
          type: { code: 'SCOOTER' },
          typeCode: 'SCOOTER',
          year: 2025,
        }),
      },
    };
    const pricing = new PrismaPricingRepository(prisma as unknown as PrismaService);
    await expect(pricing.version('pricing-1')).resolves.toMatchObject({ version: 1 });
    await expect(pricing.version('missing')).resolves.toBeNull();
    const fleet = new PrismaFleetRepository(prisma as unknown as PrismaService);
    await expect(fleet.findById('vehicle-001')).resolves.toMatchObject({ code: 'XE-001' });
  });
});
