import { Injectable } from '@nestjs/common';
import type { AuditEvent, AuditEventInput, AuditRepository } from './audit.types.js';

@Injectable()
export class DemoAuditRepository implements AuditRepository {
  private readonly events: AuditEvent[] = [];

  list(): Promise<readonly AuditEvent[]> {
    return Promise.resolve(this.events);
  }

  record(event: AuditEventInput): Promise<void> {
    this.events.push({ ...event, at: new Date() });
    return Promise.resolve();
  }
}
