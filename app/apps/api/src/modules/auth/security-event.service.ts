import { Injectable } from '@nestjs/common';

export interface SecurityEvent {
  clientIdentifier: string;
  type: 'LOGIN_RATE_LIMITED';
}

@Injectable()
export class SecurityEventService {
  private readonly recordedEvents: SecurityEvent[] = [];

  recordRateLimit(clientIdentifier: string): void {
    this.recordedEvents.push({ clientIdentifier, type: 'LOGIN_RATE_LIMITED' });
  }

  events(): readonly SecurityEvent[] {
    return this.recordedEvents;
  }
}
