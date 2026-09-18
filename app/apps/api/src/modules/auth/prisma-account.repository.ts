import { Injectable } from '@nestjs/common';
import type { Account } from '@prisma/client';
import { userRoleSchema } from '@rental/contracts';
import { DomainError } from '../../common/errors/domain.error.js';
import { PrismaService } from '../../database/prisma.service.js';
import type { AccountRecord, AccountRepository } from './auth.types.js';

const UNIQUE_VIOLATION = 'P2002';

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === UNIQUE_VIOLATION
  );
}

@Injectable()
export class PrismaAccountRepository implements AccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(record: AccountRecord): Promise<void> {
    try {
      await this.prisma.account.create({
        data: {
          active: record.active,
          id: record.id,
          name: record.name,
          passwordHash: record.passwordHash,
          role: record.role,
          username: record.username,
        },
      });
    } catch (error) {
      if (isUniqueViolation(error)) throw new DomainError('CONFLICT', 'Tên đăng nhập đã tồn tại');
      throw error;
    }
  }

  async findById(id: string): Promise<AccountRecord | null> {
    const account = await this.prisma.account.findUnique({ where: { id } });
    return account ? this.toRecord(account) : null;
  }

  async findByUsername(username: string): Promise<AccountRecord | null> {
    const account = await this.prisma.account.findUnique({ where: { username } });
    return account ? this.toRecord(account) : null;
  }

  async list(): Promise<AccountRecord[]> {
    const accounts = await this.prisma.account.findMany({ orderBy: { createdAt: 'asc' } });
    return accounts.map((account) => this.toRecord(account));
  }

  async setActive(id: string, active: boolean): Promise<void> {
    await this.prisma.account.update({ data: { active }, where: { id } });
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.prisma.account.update({ data: { passwordHash }, where: { id } });
  }

  private toRecord(account: Account): AccountRecord {
    return {
      active: account.active,
      createdAt: account.createdAt,
      id: account.id,
      name: account.name,
      passwordHash: account.passwordHash,
      role: userRoleSchema.parse(account.role),
      username: account.username,
    };
  }
}
