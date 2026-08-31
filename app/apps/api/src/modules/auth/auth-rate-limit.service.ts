import { Injectable } from '@nestjs/common';
import { MILLISECONDS_PER_MINUTE } from '../../common/time.js';
import { SecurityEventService } from './security-event.service.js';
import { AuthError } from './auth.errors.js';

const MAX_FAILURES = 5;
const LOCKOUT_MINUTES = 15;

interface FailureState {
  count: number;
  lockedUntil: number;
}

@Injectable()
export class AuthRateLimitService {
  private readonly failures = new Map<string, FailureState>();

  constructor(private readonly securityEvents: SecurityEventService) {}

  assertAllowed(identifier: string, clientIdentifier: string): void {
    const state = this.failures.get(identifier);
    if (state && state.count >= MAX_FAILURES && state.lockedUntil > Date.now()) {
      this.securityEvents.recordRateLimit(clientIdentifier);
      throw new AuthError('RATE_LIMITED', 'Thử lại sau ít phút');
    }
    if (state && state.lockedUntil <= Date.now()) this.failures.delete(identifier);
  }

  recordFailure(identifier: string): void {
    const currentCount = this.failures.get(identifier)?.count ?? 0;
    this.failures.set(identifier, {
      count: currentCount + 1,
      lockedUntil: Date.now() + LOCKOUT_MINUTES * MILLISECONDS_PER_MINUTE,
    });
  }

  clear(identifier: string): void {
    this.failures.delete(identifier);
  }
}
