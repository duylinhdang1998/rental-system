import { describe, expect, it, vi } from 'vitest';
import {
  PrismaAuditRepository,
  auditWhere,
} from '../../apps/api/src/common/audit/prisma-audit.repository';
import { DomainError } from '../../apps/api/src/common/errors/domain.error';
import type { PrismaService } from '../../apps/api/src/database/prisma.service';
import { PrismaAccountRepository } from '../../apps/api/src/modules/auth/prisma-account.repository';
import { PrismaSessionRepository } from '../../apps/api/src/modules/auth/prisma-session.repository';

const CREATED_AT = new Date('2026-09-18T03:00:00.000Z');
const ACCOUNT = {
  active: true,
  createdAt: CREATED_AT,
  id: 'account-1',
  name: 'Nguyễn Thị Lan',
  passwordHash: '$argon2id$hash',
  role: 'STAFF',
  updatedAt: CREATED_AT,
  username: 'nv.lan',
};

describe('Feature: Employee account management — Prisma adapters', () => {
  it('maps a unique-username violation to a CONFLICT domain error', async () => {
    const create = vi.fn().mockRejectedValue({ code: 'P2002' });
    const repository = new PrismaAccountRepository({
      account: { create },
    } as unknown as PrismaService);
    await expect(repository.create({ ...ACCOUNT, role: 'STAFF' })).rejects.toMatchObject(
      new DomainError('CONFLICT', 'Tên đăng nhập đã tồn tại'),
    );
    expect(create).toHaveBeenCalledWith({
      data: {
        active: true,
        id: 'account-1',
        name: 'Nguyễn Thị Lan',
        passwordHash: '$argon2id$hash',
        role: 'STAFF',
        username: 'nv.lan',
      },
    });
  });

  it('lists accounts oldest first and updates only the password hash on reset', async () => {
    const findMany = vi.fn().mockResolvedValue([ACCOUNT]);
    const update = vi.fn().mockResolvedValue(ACCOUNT);
    const repository = new PrismaAccountRepository({
      account: { findMany, update },
    } as unknown as PrismaService);
    const [record] = await repository.list();
    expect(findMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'asc' } });
    expect(record).toMatchObject({ createdAt: CREATED_AT, role: 'STAFF', username: 'nv.lan' });
    await repository.updatePasswordHash('account-1', '$argon2id$new');
    expect(update).toHaveBeenCalledWith({
      data: { passwordHash: '$argon2id$new' },
      where: { id: 'account-1' },
    });
  });

  it('deletes every session of a locked account', async () => {
    const deleteMany = vi.fn().mockResolvedValue({ count: 2 });
    const repository = new PrismaSessionRepository({
      session: { deleteMany },
    } as unknown as PrismaService);
    await repository.deleteByAccountId('account-1');
    expect(deleteMany).toHaveBeenCalledWith({ where: { accountId: 'account-1' } });
  });
});

describe('Feature: Owner audit log — Prisma adapter', () => {
  it('builds a bounded where clause and queries newest first with the page size', async () => {
    const from = new Date('2026-09-09T17:00:00.000Z');
    const to = new Date('2026-09-10T16:59:59.999Z');
    expect(auditWhere({ entityType: 'Contract', from, limit: 20, to })).toEqual({
      createdAt: { gte: from, lte: to },
      entityType: 'Contract',
    });
    expect(auditWhere({ actorId: 'staff', limit: 5 })).toEqual({ actorId: 'staff' });

    const findMany = vi.fn().mockResolvedValue([
      {
        action: 'EMPLOYEE_LOCKED',
        actorId: 'demo-owner',
        createdAt: CREATED_AT,
        entityId: 'account-1',
        entityType: 'Account',
        id: 'audit-1',
        metadata: { username: 'nv.lan' },
      },
    ]);
    const repository = new PrismaAuditRepository({
      auditEvent: { findMany },
    } as unknown as PrismaService);
    const events = await repository.query({ action: 'EMPLOYEE_LOCKED', limit: 20 });
    expect(findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
      take: 20,
      where: { action: 'EMPLOYEE_LOCKED' },
    });
    expect(events[0]).toEqual({
      action: 'EMPLOYEE_LOCKED',
      actorId: 'demo-owner',
      at: CREATED_AT,
      entityId: 'account-1',
      entityType: 'Account',
      metadata: { username: 'nv.lan' },
    });
  });
});
