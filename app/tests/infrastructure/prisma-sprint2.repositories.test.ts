import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../../apps/api/src/database/prisma.service';
import { PrismaAuditRepository } from '../../apps/api/src/common/audit/prisma-audit.repository';
import { PrismaCustomerRepository } from '../../apps/api/src/modules/customers/prisma-customer.repository';
import { PrismaFleetRepository } from '../../apps/api/src/modules/fleet/prisma-fleet.repository';

const TYPE = {
  code: 'SCOOTER',
  createdAt: new Date(),
  id: 'type-1',
  name: 'Scooter',
  updatedAt: new Date(),
};
const VEHICLE = {
  code: 'XE-1',
  color: 'Đỏ',
  createdAt: new Date(),
  id: 'vehicle-1',
  model: 'Vision',
  normalizedPlate: '43A100001',
  plate: '43A1-000.01',
  status: 'AVAILABLE',
  type: TYPE,
  typeId: TYPE.id,
  updatedAt: new Date(),
  year: 2025,
};
const CUSTOMER = {
  contacts: [
    {
      customerId: 'customer-1',
      id: 'contact-1',
      normalizedValue: '+84900000001',
      primary: true,
      type: 'PHONE',
      value: '+84900000001',
    },
  ],
  createdAt: new Date(),
  id: 'customer-1',
  name: 'Test Customer',
  nationality: 'VN',
  tags: [
    {
      code: 'BLACKLIST',
      createdAt: new Date(),
      customerId: 'customer-1',
      id: 'tag-1',
      reason: 'Synthetic risk fixture',
    },
  ],
  updatedAt: new Date(),
};

describe('Feature: Sprint 2 Prisma production adapters', () => {
  it('persists and reads audit events', async () => {
    const create = vi.fn().mockResolvedValue(undefined);
    const findMany = vi.fn().mockResolvedValue([
      {
        action: 'CREATED',
        actorId: 'actor-1',
        createdAt: new Date('2026-09-01T00:00:00Z'),
        entityId: 'entity-1',
        entityType: 'Vehicle',
      },
    ]);
    const repository = new PrismaAuditRepository({
      auditEvent: { create, findMany },
    } as unknown as PrismaService);
    await repository.record({
      action: 'CREATED',
      actorId: 'actor-1',
      entityId: 'entity-1',
      entityType: 'Vehicle',
    });
    expect(create).toHaveBeenCalledOnce();
    await expect(repository.list()).resolves.toContainEqual(
      expect.objectContaining({ action: 'CREATED', entityId: 'entity-1' }),
    );
  });

  it('covers fleet catalog, create, search and calendar persistence paths', async () => {
    const prisma = {
      vehicle: {
        create: vi.fn().mockResolvedValue(VEHICLE),
        findMany: vi.fn().mockResolvedValue([VEHICLE]),
        findUnique: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(VEHICLE),
      },
      vehicleType: {
        create: vi.fn().mockResolvedValue(TYPE),
        findMany: vi.fn().mockResolvedValue([TYPE]),
        findUnique: vi.fn().mockResolvedValue(TYPE),
      },
    };
    const repository = new PrismaFleetRepository(prisma as unknown as PrismaService);
    await expect(
      repository.createType({ code: 'SCOOTER', name: 'Scooter' }),
    ).resolves.toMatchObject({ code: 'SCOOTER' });
    await expect(
      repository.createVehicle(
        {
          code: 'XE-1',
          color: 'Đỏ',
          model: 'Vision',
          plate: '43A1-000.01',
          typeCode: 'SCOOTER',
          year: 2025,
        },
        '43A100001',
      ),
    ).resolves.toMatchObject({ status: 'AVAILABLE' });
    await expect(repository.findByPlate('missing')).resolves.toBeNull();
    await expect(repository.findByPlate('43A100001')).resolves.toMatchObject({
      plate: '43A1-000.01',
    });
    await expect(repository.listTypes()).resolves.toHaveLength(1);
    await expect(
      repository.listVehicles({ search: '000', status: 'AVAILABLE', typeCode: 'SCOOTER' }),
    ).resolves.toHaveLength(1);
    await expect(
      repository.periods({ ...VEHICLE, status: 'RENTED', typeCode: 'SCOOTER' }, ['2026-09-01']),
    ).resolves.toEqual([{ date: '2026-09-01', state: 'RENTED' }]);
  });

  it('covers missing type and both transition branches', async () => {
    const update = vi.fn().mockResolvedValue(VEHICLE);
    const historyCreate = vi.fn().mockResolvedValue(undefined);
    const prisma = {
      $transaction: vi.fn(async (operations: Array<Promise<unknown>>) => Promise.all(operations)),
      vehicle: {
        findUnique: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(VEHICLE),
        update,
      },
      vehicleStatusHistory: {
        create: historyCreate,
        findMany: vi.fn().mockResolvedValue([
          {
            actorId: 'actor-1',
            createdAt: new Date('2026-09-01T00:00:00Z'),
            from: 'AVAILABLE',
            id: 'history-1',
            reason: 'Service',
            to: 'MAINTENANCE',
          },
        ]),
      },
      vehicleType: { findUnique: vi.fn().mockResolvedValue(null) },
    };
    const repository = new PrismaFleetRepository(prisma as unknown as PrismaService);
    await expect(
      repository.createVehicle(
        {
          code: 'XE-X',
          color: 'Đỏ',
          model: 'Vision',
          plate: '43A1-999.99',
          typeCode: 'MISSING',
          year: 2025,
        },
        '43A199999',
      ),
    ).rejects.toThrow('Không tìm thấy loại xe');
    await expect(
      repository.transition('missing', 'MAINTENANCE', 'actor-1', 'Service'),
    ).resolves.toBeNull();
    await expect(
      repository.transition('vehicle-1', 'MAINTENANCE', 'actor-1', 'Service'),
    ).resolves.toMatchObject({ id: 'vehicle-1' });
    await expect(repository.statusHistory('vehicle-1')).resolves.toContainEqual(
      expect.objectContaining({ reason: 'Service', to: 'MAINTENANCE' }),
    );
    expect(update).toHaveBeenCalledOnce();
    expect(historyCreate).toHaveBeenCalledOnce();
  });

  it('covers customer create, duplicate, search and document paths', async () => {
    const prisma = {
      customer: {
        create: vi.fn().mockResolvedValue(CUSTOMER),
        findMany: vi.fn().mockResolvedValue([CUSTOMER]),
      },
      customerDocument: {
        findFirst: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({
          customerId: 'customer-1',
          id: 'doc-1',
          label: 'ID',
          objectKey: 'private/id.jpg',
        }),
      },
    };
    const repository = new PrismaCustomerRepository(prisma as unknown as PrismaService);
    await expect(
      repository.create({
        contacts: [{ primary: true, type: 'PHONE', value: '0900000001' }],
        name: 'Test Customer',
        nationality: 'VN',
        tags: [],
      }),
    ).resolves.toMatchObject({ name: 'Test Customer' });
    await expect(repository.findDocument('customer-1', 'missing')).resolves.toBeNull();
    await expect(repository.findDocument('customer-1', 'doc-1')).resolves.toMatchObject({
      id: 'doc-1',
    });
    await expect(repository.findDuplicates('+84900000001')).resolves.toHaveLength(1);
    await expect(repository.list('Test')).resolves.toContainEqual(
      expect.objectContaining({ warning: expect.objectContaining({ code: 'BLACKLIST' }) }),
    );
    await expect(repository.list()).resolves.toHaveLength(1);
  });
});
