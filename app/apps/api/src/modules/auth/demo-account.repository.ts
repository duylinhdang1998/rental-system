import { Inject, Injectable } from '@nestjs/common';
import { hash } from 'argon2';
import { ENVIRONMENT } from '../../config/configuration.js';
import type { Environment } from '../../config/environment.js';
import type { AccountRecord, AccountRepository } from './auth.types.js';

@Injectable()
export class DemoAccountRepository implements AccountRepository {
  private readonly accountsPromise: Promise<AccountRecord[]>;

  constructor(@Inject(ENVIRONMENT) environment: Environment) {
    this.accountsPromise = this.buildAccounts(environment);
  }

  async create(record: AccountRecord): Promise<void> {
    const accounts = await this.accountsPromise;
    accounts.push({ ...record, createdAt: record.createdAt ?? new Date() });
  }

  async findByUsername(username: string): Promise<AccountRecord | null> {
    const accounts = await this.accountsPromise;
    return accounts.find((account) => account.username === username) ?? null;
  }

  async findById(id: string): Promise<AccountRecord | null> {
    const accounts = await this.accountsPromise;
    return accounts.find((account) => account.id === id) ?? null;
  }

  async list(): Promise<AccountRecord[]> {
    const accounts = await this.accountsPromise;
    return accounts.map((account) => ({ ...account }));
  }

  async setActive(id: string, active: boolean): Promise<void> {
    const account = await this.findById(id);
    if (account) account.active = active;
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    const account = await this.findById(id);
    if (account) account.passwordHash = passwordHash;
  }

  private async buildAccounts(environment: Environment): Promise<AccountRecord[]> {
    const [ownerHash, staffHash] = await Promise.all([
      hash(environment.DEMO_OWNER_PASSWORD),
      hash(environment.DEMO_STAFF_PASSWORD),
    ]);
    const createdAt = new Date('2026-08-31T01:00:00.000Z');
    return [
      {
        active: true,
        createdAt,
        id: 'demo-owner',
        name: 'Chủ cửa hàng',
        passwordHash: ownerHash,
        role: 'OWNER',
        username: environment.DEMO_OWNER_USERNAME,
      },
      {
        active: true,
        createdAt,
        id: 'demo-staff',
        name: 'Nhân viên',
        passwordHash: staffHash,
        role: 'STAFF',
        username: environment.DEMO_STAFF_USERNAME,
      },
    ];
  }
}
