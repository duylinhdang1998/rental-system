import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../../apps/api/src/database/prisma.service';
import { mapRecord } from '../../apps/api/src/modules/contracts/prisma-contract.mapper';
import { PrismaContractRepository } from '../../apps/api/src/modules/contracts/prisma-contract.repository';
import { PrismaCustomerRepository } from '../../apps/api/src/modules/customers/prisma-customer.repository';

const CREATED_AT = new Date('2026-09-01T00:00:00.000Z');
const RECEIVED_AT = new Date('2026-09-10T03:00:00.000Z');
const KEY = '00000000-0000-4000-8000-000000000201';
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
const PAYMENT = {
  amountVnd: 100_000,
  contractId: 'contract-1',
  createdAt: RECEIVED_AT,
  id: KEY,
  idempotencyKey: KEY,
  kind: 'PAYMENT',
  method: 'CASH',
  notes: 'Thu tại quầy',
  receivedAt: RECEIVED_AT,
  receivedById: 'staff-1',
  reference: '',
};
const CONTRACT = {
  activatedAt: CREATED_AT,
  cancellationReason: null,
  cancelledAt: null,
  cancelledById: null,
  charges: [],
  code: 'HD-2026-TEST',
  completedAt: null,
  createdAt: CREATED_AT,
  createdById: 'staff-1',
  customerId: 'customer-1',
  customerNameSnapshot: 'Test Customer',
  deliveryFeeVnd: 0,
  events: [],
  handover: null,
  id: 'contract-1',
  idempotencyKey: '00000000-0000-4000-8000-000000000002',
  lines: [LINE],
  overdueSince: null,
  payments: [PAYMENT],
  settledAt: null,
  settlement: null,
  status: 'ACTIVE',
  totalVnd: 150_000,
};
const DRAFT = {
  amountVnd: 100_000,
  idempotencyKey: KEY,
  kind: 'PAYMENT' as const,
  method: 'CASH' as const,
  notes: 'Thu tại quầy',
  receivedAt: RECEIVED_AT.toISOString(),
  receivedById: 'staff-1',
  reference: '',
};
const EVENT = {
  actorId: 'staff-1',
  metadata: { amountVnd: 100_000, kind: 'PAYMENT', method: 'CASH' },
  occurredAt: RECEIVED_AT.toISOString(),
  reason: 'Thu tại quầy',
  type: 'PAYMENT_RECORDED' as const,
};
const MAPPED_PAYMENT = {
  amountVnd: 100_000,
  id: KEY,
  kind: 'PAYMENT',
  method: 'CASH',
  notes: 'Thu tại quầy',
  receivedAt: RECEIVED_AT.toISOString(),
  receivedById: 'staff-1',
  reference: '',
};

function prismaWith(overrides: object = {}) {
  const transaction = { contract: { update: vi.fn().mockResolvedValue(CONTRACT) } };
  const prisma = {
    $transaction: vi.fn((callback: (client: typeof transaction) => unknown) =>
      callback(transaction),
    ),
    contract: {
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([CONTRACT]),
    },
    ...overrides,
  };
  const repository = new PrismaContractRepository(prisma as unknown as PrismaService);
  return { prisma, repository, transaction };
}

describe('Feature: Sprint 6 Prisma production adapters', () => {
  it('writes the ledger row (keyed by the idempotency key) and the event in one transaction', async () => {
    const { prisma, repository, transaction } = prismaWith();
    const contract = await repository.addPayment('contract-1', DRAFT, EVENT);
    expect(transaction.contract.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          events: {
            create: expect.objectContaining({ reason: 'Thu tại quầy', type: 'PAYMENT_RECORDED' }),
          },
          payments: {
            create: {
              amountVnd: 100_000,
              id: KEY,
              idempotencyKey: KEY,
              kind: 'PAYMENT',
              method: 'CASH',
              notes: 'Thu tại quầy',
              receivedAt: RECEIVED_AT,
              receivedById: 'staff-1',
              reference: '',
            },
          },
        },
        where: { id: 'contract-1' },
      }),
    );
    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: 'Serializable',
    });
    expect(contract.payments).toEqual([MAPPED_PAYMENT]);
  });

  it('turns a unique-key race into the stored row and rethrows anything else', async () => {
    const duplicate = Object.assign(new Error('duplicate'), { code: 'P2002' });
    const { prisma, repository } = prismaWith({
      $transaction: vi.fn().mockRejectedValue(duplicate),
      contract: { findFirst: vi.fn().mockResolvedValue(CONTRACT) },
    });
    const stored = await repository.addPayment('contract-1', DRAFT, EVENT);
    expect(stored.payments[0]).toEqual(MAPPED_PAYMENT);
    expect(prisma.contract.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { payments: { some: { idempotencyKey: KEY } } } }),
    );

    const broken = prismaWith({ $transaction: vi.fn().mockRejectedValue(new Error('boom')) });
    await expect(broken.repository.addPayment('contract-1', DRAFT, EVENT)).rejects.toThrow('boom');
    const orphan = prismaWith({
      $transaction: vi.fn().mockRejectedValue(duplicate),
      contract: { findFirst: vi.fn().mockResolvedValue(null) },
    });
    await expect(orphan.repository.addPayment('contract-1', DRAFT, EVENT)).rejects.toBe(duplicate);
  });

  it('finds a contract by payment key and lists every non-cancelled contract for finance', async () => {
    const { prisma, repository } = prismaWith();
    expect(await repository.findByPaymentKey(KEY)).toBeNull();
    const financial = await repository.listFinancial();
    expect(prisma.contract.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'asc' },
        where: { status: { not: 'CANCELLED' } },
      }),
    );
    expect(financial[0]).toMatchObject({ id: 'contract-1', payments: [MAPPED_PAYMENT] });
    expect(mapRecord({ ...CONTRACT, payments: [] }).payments).toEqual([]);
  });

  it('loads a customer summary by id for the report contact column', async () => {
    const record = {
      contacts: [{ primary: true, type: 'PHONE', value: '0900 000 001' }],
      createdAt: CREATED_AT,
      id: 'customer-1',
      name: 'Khách hàng mẫu',
      nationality: 'VN',
      tags: [],
    };
    const prisma = { customer: { findUnique: vi.fn().mockResolvedValue(record) } };
    const repository = new PrismaCustomerRepository(prisma as unknown as PrismaService);
    expect(await repository.findById('customer-1')).toMatchObject({
      contacts: [{ primary: true, value: '0900 000 001' }],
      id: 'customer-1',
      name: 'Khách hàng mẫu',
    });
    expect(prisma.customer.findUnique).toHaveBeenCalledWith({
      include: { contacts: true, tags: true },
      where: { id: 'customer-1' },
    });
    prisma.customer.findUnique.mockResolvedValue(null);
    expect(await repository.findById('missing')).toBeNull();
  });
});
