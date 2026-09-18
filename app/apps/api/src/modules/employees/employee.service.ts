import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type {
  AuthenticatedUser,
  CreateEmployeeInput,
  Employee,
  EmployeeList,
} from '@rental/contracts';
import { hash } from 'argon2';
import { AuditService } from '../../common/audit/audit.service.js';
import { DomainError } from '../../common/errors/domain.error.js';
import { AuthRepository } from '../auth/auth.repository.js';
import type { AccountRecord } from '../auth/auth.types.js';

const ENTITY_TYPE = 'Account';

/** Never leaks the hash: the API view of an account is the record minus its credential. */
function toEmployee(record: AccountRecord): Employee {
  return {
    active: record.active,
    id: record.id,
    name: record.name,
    role: record.role,
    username: record.username,
    ...(record.createdAt ? { createdAt: record.createdAt.toISOString() } : {}),
  };
}

/** US-006: the Owner creates, locks, unlocks and resets accounts; history is never deleted. */
@Injectable()
export class EmployeeService {
  constructor(
    private readonly accounts: AuthRepository,
    private readonly audit: AuditService,
  ) {}

  async list(): Promise<EmployeeList> {
    const records = await this.accounts.listAccounts();
    return { count: records.length, items: records.map(toEmployee) };
  }

  async create(input: CreateEmployeeInput, actor: AuthenticatedUser): Promise<Employee> {
    const existing = await this.accounts.findAccount(input.username);
    if (existing) throw new DomainError('CONFLICT', 'Tên đăng nhập đã tồn tại');
    const record: AccountRecord = {
      active: true,
      createdAt: new Date(),
      id: randomUUID(),
      name: input.name,
      passwordHash: await hash(input.password),
      role: input.role,
      username: input.username,
    };
    await this.accounts.createAccount(record);
    await this.audit.record({
      action: 'EMPLOYEE_CREATED',
      actorId: actor.id,
      entityId: record.id,
      entityType: ENTITY_TYPE,
      metadata: { role: record.role, username: record.username },
    });
    return toEmployee(record);
  }

  async setActive(id: string, active: boolean, actor: AuthenticatedUser): Promise<Employee> {
    const record = await this.require(id);
    if (!active && record.id === actor.id) {
      throw new DomainError('CONFLICT', 'Không thể tự khóa tài khoản của bạn');
    }
    if (record.active === active) return toEmployee(record);
    await this.accounts.setAccountActive(id, active);
    if (!active) await this.accounts.deleteSessionsForAccount(id);
    await this.audit.record({
      action: active ? 'EMPLOYEE_UNLOCKED' : 'EMPLOYEE_LOCKED',
      actorId: actor.id,
      entityId: id,
      entityType: ENTITY_TYPE,
      metadata: { username: record.username },
    });
    return toEmployee({ ...record, active });
  }

  async resetPassword(id: string, password: string, actor: AuthenticatedUser): Promise<Employee> {
    const record = await this.require(id);
    await this.accounts.updatePasswordHash(id, await hash(password));
    await this.accounts.deleteSessionsForAccount(id);
    await this.audit.record({
      action: 'EMPLOYEE_PASSWORD_RESET',
      actorId: actor.id,
      entityId: id,
      entityType: ENTITY_TYPE,
      metadata: { username: record.username },
    });
    return toEmployee(record);
  }

  private async require(id: string): Promise<AccountRecord> {
    const record = await this.accounts.findAccountById(id);
    if (!record) throw new DomainError('NOT_FOUND', 'Không tìm thấy tài khoản');
    return record;
  }
}
