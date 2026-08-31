import { Injectable } from '@nestjs/common';
import type { CreateSessionInput, SessionRecord, SessionRepository } from './auth.types.js';

@Injectable()
export class MemorySessionRepository implements SessionRepository {
  private readonly sessions = new Map<string, SessionRecord>();

  create(input: CreateSessionInput): Promise<void> {
    const { tokenHash, ...session } = input;
    this.sessions.set(tokenHash, session);
    return Promise.resolve();
  }

  deleteByTokenHash(tokenHash: string): Promise<void> {
    this.sessions.delete(tokenHash);
    return Promise.resolve();
  }

  findByTokenHash(tokenHash: string): Promise<SessionRecord | null> {
    return Promise.resolve(this.sessions.get(tokenHash) ?? null);
  }
}
