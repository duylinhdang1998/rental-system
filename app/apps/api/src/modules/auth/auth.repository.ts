import { Inject, Injectable } from '@nestjs/common';
import { ACCOUNT_REPOSITORY, SESSION_REPOSITORY } from './auth.tokens.js';
import type {
  AccountRecord,
  AccountRepository,
  CreateSessionInput,
  SessionRecord,
  SessionRepository,
} from './auth.types.js';

@Injectable()
export class AuthRepository {
  constructor(
    @Inject(ACCOUNT_REPOSITORY) private readonly accounts: AccountRepository,
    @Inject(SESSION_REPOSITORY) private readonly sessions: SessionRepository,
  ) {}

  findAccount(username: string): Promise<AccountRecord | null> {
    return this.accounts.findByUsername(username);
  }

  findAccountById(id: string): Promise<AccountRecord | null> {
    return this.accounts.findById(id);
  }

  setAccountActive(id: string, active: boolean): Promise<void> {
    return this.accounts.setActive(id, active);
  }

  createSession(input: CreateSessionInput): Promise<void> {
    return this.sessions.create(input);
  }

  deleteSession(tokenHash: string): Promise<void> {
    return this.sessions.deleteByTokenHash(tokenHash);
  }

  findSession(tokenHash: string): Promise<SessionRecord | null> {
    return this.sessions.findByTokenHash(tokenHash);
  }
}
