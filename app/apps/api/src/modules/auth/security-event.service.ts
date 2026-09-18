import { Injectable } from '@nestjs/common';
import { StructuredLogger } from '../../common/logging/structured-logger.js';

export type SecurityEventType = 'LOGIN_RATE_LIMITED' | 'REQUEST_RATE_LIMITED';

export interface SecurityEvent {
  clientIdentifier: string;
  policy?: string;
  type: SecurityEventType;
}

/** Keeps the recent events in memory for tests and dashboards and mirrors each to the log. */
@Injectable()
export class SecurityEventService {
  private readonly recordedEvents: SecurityEvent[] = [];

  constructor(private readonly logger: StructuredLogger) {}

  recordRateLimit(clientIdentifier: string): void {
    this.record({ clientIdentifier, type: 'LOGIN_RATE_LIMITED' });
  }

  recordThrottle(clientIdentifier: string, policy: string): void {
    this.record({ clientIdentifier, policy, type: 'REQUEST_RATE_LIMITED' });
  }

  events(): readonly SecurityEvent[] {
    return this.recordedEvents;
  }

  private record(event: SecurityEvent): void {
    this.recordedEvents.push(event);
    this.logger.log({ ...event, event: 'security.event', level: 'warn' });
  }
}
