import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../../apps/api/src/database/prisma.service';
import { PrismaContractRepository } from '../../apps/api/src/modules/contracts/prisma-contract.repository';
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
  startAt: new Date('2026-09-01T08:00:00.000Z'),
  vehicle: { code: 'XE-001' },
  vehicleId: 'vehicle-001',
};
const CONTRACT = {
  code: 'HD-2026-TEST',
  createdAt: CREATED_AT,
  createdById: 'staff-1',
  customerId: 'customer-1',
  customerNameSnapshot: 'Test Customer',
  deliveryFeeVnd: 0,
  handover: {
    contractId: 'contract-1',
    deliveryPlace: 'Store',
    depositVnd: 0,
    fuelPercent: 100,
    id: 'handover-1',
    imageObjectKeys: ['private/handovers/a.jpg'],
    notes: '',
    retainedDocument: '',
  },
  id: 'contract-1',
  idempotencyKey: '00000000-0000-4000-8000-000000000001',
  lines: [LINE],
  status: 'CONFIRMED',
  totalVnd: 150_000,
};

describe('Feature: Sprint 3 Prisma production adapters', () => {
  it('reads, publishes and maps pricing versions', async () => {
    const transaction = {
      pricingVersion: {
        create: vi.fn().mockResolvedValue(PRICING),
        findFirst: vi.fn().mockResolvedValue(PRICING),
      },
    };
    const prisma = {
      $transaction: vi.fn((callback) => callback(transaction)),
      customer: {
        findUnique: vi
          .fn()
          .mockResolvedValueOnce({ name: 'VIP', tags: [{ code: 'VIP' }] })
          .mockResolvedValueOnce(null),
      },
      pricingVersion: {
        findFirst: vi.fn().mockResolvedValueOnce(PRICING).mockResolvedValueOnce(null),
      },
      vehicle: {
        findMany: vi
          .fn()
          .mockResolvedValue([{ code: 'XE-001', id: 'vehicle-001', type: { code: 'SCOOTER' } }]),
      },
    };
    const repository = new PrismaPricingRepository(prisma as unknown as PrismaService);
    await expect(repository.customer('vip')).resolves.toEqual({
      adjustmentPercent: 10,
      name: 'VIP',
    });
    await expect(repository.customer('missing')).resolves.toBeNull();
    await expect(repository.current('SCOOTER')).resolves.toMatchObject({ version: 1 });
    await expect(repository.current('MISSING')).resolves.toBeNull();
    await expect(
      repository.publish(
        {
          lateReturnPolicy: { graceMinutes: 60, hourlyRateVnd: 20_000 },
          tiers: [{ dailyRateVnd: 150_000, maxDays: null, minDays: 1 }],
          typeCode: 'SCOOTER',
        },
        'owner-1',
      ),
    ).resolves.toMatchObject({ id: 'pricing-1' });
    await expect(repository.vehicles(['vehicle-001'])).resolves.toEqual([
      { code: 'XE-001', id: 'vehicle-001', typeCode: 'SCOOTER' },
    ]);
  });

  it('creates, reads and checks conflicts through the contract transaction adapter', async () => {
    const transaction = {
      contract: {
        create: vi.fn().mockResolvedValue(CONTRACT),
        findUnique: vi.fn().mockResolvedValue(null),
      },
    };
    const prisma = {
      $transaction: vi.fn((callback) => callback(transaction)),
      contract: { findUnique: vi.fn().mockResolvedValueOnce(CONTRACT).mockResolvedValueOnce(null) },
      contractHandover: {
        findUnique: vi.fn().mockResolvedValueOnce(CONTRACT.handover).mockResolvedValueOnce(null),
      },
      contractVehicleLine: {
        findMany: vi.fn().mockResolvedValue([{ ...LINE, contract: CONTRACT }]),
      },
    };
    const repository = new PrismaContractRepository(prisma as unknown as PrismaService);
    await expect(
      repository.createAtomic({
        actorId: 'staff-1',
        code: CONTRACT.code,
        customerId: CONTRACT.customerId,
        handover: { ...CONTRACT.handover },
        idempotencyKey: CONTRACT.idempotencyKey,
        quote: {
          customerName: 'Test Customer',
          deliveryFeeVnd: 0,
          endAt: LINE.endAt.toISOString(),
          lines: [
            {
              ...LINE,
              lateReturnPolicy: { graceMinutes: 60, hourlyRateVnd: 20_000 },
              overrideReason: undefined,
              pricingVersionNumber: 1,
              vehicleCode: 'XE-001',
            },
          ],
          startAt: LINE.startAt.toISOString(),
          totalVnd: 150_000,
        },
      }),
    ).resolves.toMatchObject({ code: CONTRACT.code });
    await expect(repository.findById('contract-1')).resolves.toMatchObject({
      handover: { imageCount: 1 },
    });
    await expect(repository.findByIdempotencyKey('missing')).resolves.toBeNull();
    await expect(
      repository.findConflicts({
        endAt: LINE.endAt.toISOString(),
        startAt: LINE.startAt.toISOString(),
        vehicleIds: ['vehicle-001'],
      }),
    ).resolves.toContainEqual(expect.objectContaining({ contractCode: CONTRACT.code }));
    await expect(repository.imageObjectKeys('contract-1')).resolves.toEqual([
      'private/handovers/a.jpg',
    ]);
    await expect(repository.imageObjectKeys('missing')).resolves.toEqual([]);
  });

  it('returns an idempotent transaction result and converts overlap errors', async () => {
    const existingPrisma = {
      $transaction: vi.fn((callback) =>
        callback({ contract: { findUnique: vi.fn().mockResolvedValue(CONTRACT) } }),
      ),
    };
    const draft = {
      actorId: 'staff-1',
      code: CONTRACT.code,
      customerId: CONTRACT.customerId,
      handover: { ...CONTRACT.handover },
      idempotencyKey: CONTRACT.idempotencyKey,
      quote: {
        customerName: 'Test Customer',
        deliveryFeeVnd: 0,
        endAt: LINE.endAt.toISOString(),
        lines: [
          {
            ...LINE,
            lateReturnPolicy: { graceMinutes: 60, hourlyRateVnd: 20_000 },
            overrideReason: undefined,
            pricingVersionNumber: 1,
            vehicleCode: 'XE-001',
          },
        ],
        startAt: LINE.startAt.toISOString(),
        totalVnd: 150_000,
      },
    };
    await expect(
      new PrismaContractRepository(existingPrisma as unknown as PrismaService).createAtomic(draft),
    ).resolves.toMatchObject({ id: CONTRACT.id });
    const failingPrisma = {
      $transaction: vi.fn().mockRejectedValue(new Error('ContractVehicleLine_no_overlap')),
    };
    await expect(
      new PrismaContractRepository(failingPrisma as unknown as PrismaService).createAtomic(draft),
    ).rejects.toThrow('trùng thời gian');
  });
});
