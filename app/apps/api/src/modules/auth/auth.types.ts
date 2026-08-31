import type { AuthenticatedUser } from '@rental/contracts';

export interface AccountRecord extends AuthenticatedUser {
  active: boolean;
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
  findById(id: string): Promise<AccountRecord | null>;
  findByUsername(username: string): Promise<AccountRecord | null>;
  setActive(id: string, active: boolean): Promise<void>;
}

export interface SessionRepository {
  create(input: CreateSessionInput): Promise<void>;
  deleteByTokenHash(tokenHash: string): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<SessionRecord | null>;
}

export interface IssuedSession {
  csrfToken: string;
  sessionToken: string;
  user: AuthenticatedUser;
}
