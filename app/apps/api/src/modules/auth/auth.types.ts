import type { AuthenticatedUser } from '@rental/contracts';

export interface AccountRecord extends AuthenticatedUser {
  active: boolean;
  createdAt?: Date;
  passwordHash: string;
}

export interface SessionRecord {
  csrfHash: string;
  expiresAt: Date;
  user: AuthenticatedUser;
}

export interface CreateSessionInput extends SessionRecord {
  tokenHash: string;
}

export interface AccountRepository {
  create(record: AccountRecord): Promise<void>;
  findById(id: string): Promise<AccountRecord | null>;
  findByUsername(username: string): Promise<AccountRecord | null>;
  list(): Promise<AccountRecord[]>;
  setActive(id: string, active: boolean): Promise<void>;
  updatePasswordHash(id: string, passwordHash: string): Promise<void>;
}

export interface SessionRepository {
  create(input: CreateSessionInput): Promise<void>;
  deleteByAccountId(accountId: string): Promise<void>;
  deleteByTokenHash(tokenHash: string): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<SessionRecord | null>;
}

export interface IssuedSession {
  csrfToken: string;
  sessionToken: string;
  user: AuthenticatedUser;
}
