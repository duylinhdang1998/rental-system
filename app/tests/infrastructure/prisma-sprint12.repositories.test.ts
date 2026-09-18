import { describe, expect, it, vi } from 'vitest';
import { DomainError } from '../../apps/api/src/common/errors/domain.error';
import type { PrismaService } from '../../apps/api/src/database/prisma.service';
import {
  PrismaCashShiftRepository,
  closeData,
  mapCashShift,
} from '../../apps/api/src/modules/cash-shifts/prisma-cash-shift.repository';
import { PrismaContractRepository } from '../../apps/api/src/modules/contracts/prisma-contract.repository';
import { contractListWhere } from '../../apps/api/src/modules/contracts/prisma-contract.queries';
import {
  PrismaDamageCatalogRepository,
  mapDamageItem,
} from '../../apps/api/src/modules/damage-catalog/prisma-damage-catalog.repository';

const AT = new Date('2026-09-18T03:00:00.000Z');
const ITEM_ROW = {
  active: true,
  code: 'GUONG',
  createdAt: AT,
  id: 'item-1',
  name: 'Gương',
  priceVnd: 120_000,
  updatedAt: AT,
};
const SHIFT_ROW = {
  closedAt: null,
  closedById: null,
  countedCashVnd: null,
  expectedCashVnd: null,
  id: 'shift-1',
  note: '',
  openedAt: AT,
  openedById: 'staff-1',
  openingFloatVnd: 500_000,
  status: 'OPEN' as const,
  varianceVnd: null,
};
const CLOSE = {
  closedAt: '2026-09-18T09:00:00.000Z',
  closedById: 'owner-1',
  countedCashVnd: 480_000,
  expectedCashVnd: 500_000,
  note: 'Thiếu',
  varianceVnd: -20_000,
};

describe('Feature: Operations finance — Prisma adapters (Sprint 12)', () => {
  it('maps catalog rows, filters inactive items and turns a duplicate code into DAMAGE_ITEM_EXISTS', async () => {
    expect(mapDamageItem(ITEM_ROW)).toEqual({
      ...ITEM_ROW,
      createdAt: AT.toISOString(),
      updatedAt: AT.toISOString(),
    });
    const create = vi.fn().mockResolvedValue(ITEM_ROW);
    const findMany = vi.fn().mockResolvedValue([ITEM_ROW]);
    const findUnique = vi.fn().mockResolvedValue(null);
    const update = vi.fn().mockResolvedValue({ ...ITEM_ROW, active: false });
    const repository = new PrismaDamageCatalogRepository({
      damageItem: { create, findMany, findUnique, update },
    } as unknown as PrismaService);
    const draft = { code: 'GUONG', name: 'Gương', priceVnd: 120_000 };
    await expect(repository.create(draft)).resolves.toMatchObject({ id: 'item-1' });
    expect(create).toHaveBeenCalledWith({ data: draft });
    await repository.list(false);
    expect(findMany).toHaveBeenLastCalledWith({
      orderBy: { code: 'asc' },
      where: { active: true },
    });
    await repository.list(true);
    expect(findMany).toHaveBeenLastCalledWith({ orderBy: { code: 'asc' }, where: {} });
    await expect(repository.findById('missing')).resolves.toBeNull();
    await expect(repository.update('item-1', { active: false })).resolves.toMatchObject({
      active: false,
    });
    create.mockRejectedValueOnce({ code: 'P2002' });
    await expect(repository.create(draft)).rejects.toMatchObject(
      new DomainError('DAMAGE_ITEM_EXISTS', 'Mã hạng mục đã tồn tại'),
    );
    create.mockRejectedValueOnce(new Error('boom'));
    await expect(repository.create(draft)).rejects.toThrow('boom');
  });

  it('maps shift rows, writes the frozen close and maps the single-open index violation', async () => {
    expect(mapCashShift(SHIFT_ROW)).toEqual({ ...SHIFT_ROW, openedAt: AT.toISOString() });
    expect(mapCashShift({ ...SHIFT_ROW, closedAt: AT, status: 'CLOSED' })).toMatchObject({
      closedAt: AT.toISOString(),
      status: 'CLOSED',
    });
    expect(closeData(CLOSE)).toEqual({
      ...CLOSE,
      closedAt: new Date(CLOSE.closedAt),
      status: 'CLOSED',
    });

    const create = vi.fn().mockResolvedValue(SHIFT_ROW);
    const findFirst = vi.fn().mockResolvedValue(SHIFT_ROW);
    const findMany = vi.fn().mockResolvedValue([SHIFT_ROW]);
    const findUnique = vi.fn().mockResolvedValue(null);
    const update = vi.fn().mockResolvedValue({ ...SHIFT_ROW, status: 'CLOSED' });
    const repository = new PrismaCashShiftRepository({
      cashShift: { create, findFirst, findMany, findUnique, update },
    } as unknown as PrismaService);
    const draft = { openedAt: AT.toISOString(), openedById: 'staff-1', openingFloatVnd: 500_000 };
    await expect(repository.create(draft)).resolves.toMatchObject({ id: 'shift-1' });
    expect(create).toHaveBeenCalledWith({ data: { ...draft, openedAt: AT } });
    await expect(repository.findOpen()).resolves.toMatchObject({ status: 'OPEN' });
    expect(findFirst).toHaveBeenCalledWith({ where: { status: 'OPEN' } });
    await expect(repository.findById('missing')).resolves.toBeNull();
    await repository.list();
    expect(findMany).toHaveBeenLastCalledWith({ orderBy: { openedAt: 'desc' }, where: {} });
    await repository.list('staff-1');
    expect(findMany).toHaveBeenLastCalledWith({
      orderBy: { openedAt: 'desc' },
      where: { openedById: 'staff-1' },
    });
    await expect(repository.close('shift-1', CLOSE)).resolves.toMatchObject({ status: 'CLOSED' });
    expect(update).toHaveBeenCalledWith({ data: closeData(CLOSE), where: { id: 'shift-1' } });
    create.mockRejectedValueOnce({ code: 'P2002' });
    await expect(repository.create(draft)).rejects.toMatchObject({
      code: 'CASH_SHIFT_ALREADY_OPEN',
    });
    create.mockRejectedValueOnce(new Error('down'));
    await expect(repository.create(draft)).rejects.toThrow('down');
  });

  it('reads a line’s photo keys scoped to its contract and builds the list filter', async () => {
    const findFirst = vi
      .fn()
      .mockResolvedValue({ returnImageObjectKeys: ['private/returns/hd-1/a.png'] });
    const repository = new PrismaContractRepository({
      contractVehicleLine: { findFirst },
    } as unknown as PrismaService);
    await expect(repository.returnImageObjectKeys('hd-1', 'line-1')).resolves.toEqual([
      'private/returns/hd-1/a.png',
    ]);
    expect(findFirst).toHaveBeenCalledWith({
      select: { returnImageObjectKeys: true },
      where: { contractId: 'hd-1', id: 'line-1' },
    });
    findFirst.mockResolvedValueOnce(null);
    await expect(repository.returnImageObjectKeys('hd-1', 'other')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    expect(contractListWhere({})).toEqual({});
    expect(contractListWhere({ search: ' XE-0 ', status: 'ACTIVE' })).toMatchObject({
      OR: expect.arrayContaining([{ code: { contains: 'XE-0', mode: 'insensitive' } }]),
      status: 'ACTIVE',
    });
  });
});
