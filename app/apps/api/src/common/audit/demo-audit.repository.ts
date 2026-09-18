import { Injectable } from '@nestjs/common';
import type { AuditEvent, AuditEventInput, AuditFilter, AuditRepository } from './audit.types.js';

const EXACT_FIELDS = ['action', 'actorId', 'entityId', 'entityType'] as const;

function withinRange(at: Date, filter: AuditFilter): boolean {
  if (filter.from && at < filter.from) return false;
  return !(filter.to && at > filter.to);
}

export function matchesAuditFilter(event: AuditEvent, filter: AuditFilter): boolean {
  const exact = EXACT_FIELDS.every((field) => !filter[field] || event[field] === filter[field]);
  return exact && withinRange(event.at, filter);
}

@Injectable()
export class DemoAuditRepository implements AuditRepository {
  private readonly events: AuditEvent[] = [];

  list(): Promise<readonly AuditEvent[]> {
    return Promise.resolve(this.events);
  }

  query(filter: AuditFilter): Promise<readonly AuditEvent[]> {
    const matching = this.events
      .filter((event) => matchesAuditFilter(event, filter))
      .sort((left, right) => right.at.getTime() - left.at.getTime())
      .slice(0, filter.limit);
    return Promise.resolve(matching);
  }

  record(event: AuditEventInput): Promise<void> {
    this.events.push({ ...event, at: new Date() });
    return Promise.resolve();
  }
}
