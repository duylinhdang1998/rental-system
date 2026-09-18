import { describe, expect, it, vi } from 'vitest';
import { DomainError } from '../../apps/api/src/common/errors/domain.error';
import type { PrismaService } from '../../apps/api/src/database/prisma.service';
import {
  EXPENSE_INCLUDE,
  PrismaEconomicsRepository,
  expenseData,
  expenseWhere,
  mapAcquisition,
  mapExpense,
} from '../../apps/api/src/modules/economics/prisma-economics.repository';

const CREATED_AT = new Date('2026-09-10T03:00:00.000Z');
const PAID_ON = new Date('2026-09-10T00:00:00.000Z');
const ROW = {
  amountVnd: 250_000,
  category: 'MAINTENANCE' as const,
  createdAt: CREATED_AT,
  description: 'Thay nhớt',
  id: 'expense-1',
  idempotencyKey: '00000000-0000-4000-8000-000000000301',
  method: 'CASH' as const,
  notes: '',
  paidOn: PAID_ON,
  recordedById: 'demo-staff',
  reference: '',
  reversal: null,
  reversalOfId: null,
  vehicle: { code: 'XE-001' },
  vehicleId: 'vehicle-001',
};
const DRAFT = {
  amountVnd: 250_000,
  category: 'MAINTENANCE' as const,
  description: 'Thay nhớt',
  idempotencyKey: ROW.idempotencyKey,
  method: 'CASH' as const,
  notes: '',
  paidOn: '2026-09-10',
  recordedById: 'demo-staff',
  reference: '',
  reversalOfId: null,
  vehicleCode: 'XE-001',
  vehicleId: 'vehicle-001',
};

describe('Feature: Asset economics — Prisma adapters', () => {
  it('maps a ledger row to the API shape with the reversal link and vehicle code', () => {
    expect(mapExpense({ ...ROW, reversal: { id: 'expense-2' } })).toEqual({
      amountVnd: 250_000,
      category: 'MAINTENANCE',
      createdAt: CREATED_AT.toISOString(),
      description: 'Thay nhớt',
      id: 'expense-1',
      method: 'CASH',
      notes: '',
      paidOn: '2026-09-10',
      recordedById: 'demo-staff',
      reference: '',
      reversalOfId: null,
      reversedByExpenseId: 'expense-2',
      vehicleCode: 'XE-001',
      vehicleId: 'vehicle-001',
    });
    expect(mapExpense({ ...ROW, vehicle: null, vehicleId: null })).toMatchObject({
      vehicleCode: null,
      vehicleId: null,
    });
  });

  it('maps an acquisition row with a calendar purchase day', () => {
    expect(
      mapAcquisition({
        createdAt: CREATED_AT,
        purchasePriceVnd: 30_000_000,
        purchasedOn: new Date('2026-01-15T00:00:00.000Z'),
        salvageValueVnd: 3_000_000,
        updatedAt: CREATED_AT,
        updatedById: 'demo-owner',
        usefulLifeMonths: 36,
        vehicleId: 'vehicle-001',
      }),
    ).toEqual({
      purchasePriceVnd: 30_000_000,
      purchasedOn: '2026-01-15',
      salvageValueVnd: 3_000_000,
      updatedAt: CREATED_AT.toISOString(),
      updatedById: 'demo-owner',
      usefulLifeMonths: 36,
      vehicleId: 'vehicle-001',
    });
  });

  it('builds the where clause only from the filters that were given', () => {
    expect(expenseWhere({})).toEqual({});
    expect(
      expenseWhere({ category: 'FUEL', from: '2026-09-05', vehicleId: 'vehicle-001' }),
    ).toEqual({
      category: 'FUEL',
      paidOn: { gte: new Date('2026-09-05T00:00:00.000Z') },
      vehicleId: 'vehicle-001',
    });
    expect(expenseWhere({ to: '2026-09-12' })).toEqual({
      paidOn: { lte: new Date('2026-09-12T00:00:00.000Z') },
    });
  });

  it('connects the vehicle and the reversed original only when present', () => {
    expect(expenseData(DRAFT)).toMatchObject({
      paidOn: PAID_ON,
      vehicle: { connect: { id: 'vehicle-001' } },
    });
    expect(expenseData(DRAFT)).not.toHaveProperty('reversalOf');
    expect(expenseData({ ...DRAFT, reversalOfId: 'expense-1', vehicleId: null })).toMatchObject({
      reversalOf: { connect: { id: 'expense-1' } },
    });
    expect(expenseData({ ...DRAFT, vehicleId: null })).not.toHaveProperty('vehicle');
  });

  it('appends rows, maps a unique violation to CONFLICT and lists with the include', async () => {
    const create = vi.fn().mockResolvedValue(ROW);
    const findMany = vi.fn().mockResolvedValue([ROW]);
    const findUnique = vi.fn().mockResolvedValue(null);
    const repository = new PrismaEconomicsRepository({
      expense: { create, findMany, findUnique },
    } as unknown as PrismaService);

    await expect(repository.createExpense(DRAFT)).resolves.toMatchObject({ id: 'expense-1' });
    expect(create).toHaveBeenCalledWith({ data: expenseData(DRAFT), include: EXPENSE_INCLUDE });
    await expect(
      repository.listExpenses({ limit: 10, vehicleId: 'vehicle-001' }),
    ).resolves.toHaveLength(1);
    expect(findMany).toHaveBeenCalledWith({
      include: EXPENSE_INCLUDE,
      orderBy: [{ paidOn: 'desc' }, { createdAt: 'desc' }],
      take: 10,
      where: { vehicleId: 'vehicle-001' },
    });
    await expect(repository.findExpenseByKey('missing')).resolves.toBeNull();

    create.mockRejectedValueOnce({ code: 'P2002' });
    await expect(repository.createExpense(DRAFT)).rejects.toMatchObject(
      new DomainError('CONFLICT', 'Khoản chi đã được ghi hoặc đã được đảo'),
    );
    create.mockRejectedValueOnce(new Error('boom'));
    await expect(repository.createExpense(DRAFT)).rejects.toThrow('boom');
  });

  it('upserts the acquisition by vehicle id', async () => {
    const upsert = vi.fn().mockResolvedValue({
      createdAt: CREATED_AT,
      purchasePriceVnd: 30_000_000,
      purchasedOn: new Date('2026-01-15T00:00:00.000Z'),
      salvageValueVnd: 3_000_000,
      updatedAt: CREATED_AT,
      updatedById: 'demo-owner',
      usefulLifeMonths: 36,
      vehicleId: 'vehicle-001',
    });
    const repository = new PrismaEconomicsRepository({
      vehicleAcquisition: { findMany: vi.fn().mockResolvedValue([]), upsert },
    } as unknown as PrismaService);
    await expect(
      repository.upsertAcquisition({
        purchasePriceVnd: 30_000_000,
        purchasedOn: '2026-01-15',
        salvageValueVnd: 3_000_000,
        updatedById: 'demo-owner',
        usefulLifeMonths: 36,
        vehicleId: 'vehicle-001',
      }),
    ).resolves.toMatchObject({ purchasedOn: '2026-01-15', vehicleId: 'vehicle-001' });
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ vehicle: { connect: { id: 'vehicle-001' } } }),
        where: { vehicleId: 'vehicle-001' },
      }),
    );
    await expect(repository.listAcquisitions()).resolves.toEqual([]);
  });
});
