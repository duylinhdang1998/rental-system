import { Injectable } from '@nestjs/common';
import type { Account } from '@prisma/client';
import { userRoleSchema } from '@rental/contracts';
import { PrismaService } from '../../database/prisma.service.js';
import type { AccountRecord, AccountRepository } from './auth.types.js';

@Injectable()
export class PrismaAccountRepository implements AccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<AccountRecord | null> {
    const account = await this.prisma.account.findUnique({ where: { id } });
    return account ? this.toRecord(account) : null;
  }

  async findByUsername(username: string): Promise<AccountRecord | null> {
    const account = await this.prisma.account.findUnique({ where: { username } });
    return account ? this.toRecord(account) : null;
  }

  async setActive(id: string, active: boolean): Promise<void> {
    await this.prisma.account.update({ data: { active }, where: { id } });
  }

  private toRecord(account: Account): AccountRecord {
    return {
      active: account.active,
      id: account.id,
      name: account.name,
      passwordHash: account.passwordHash,
      role: userRoleSchema.parse(account.role),
      username: account.username,
    };
  }
}
