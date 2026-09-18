import { Inject, Injectable } from '@nestjs/common';
import { AUDIT_REPOSITORY } from './audit.tokens.js';
import type { AuditEvent, AuditEventInput, AuditFilter, AuditRepository } from './audit.types.js';

@Injectable()
export class AuditService {
  constructor(@Inject(AUDIT_REPOSITORY) private readonly repository: AuditRepository) {}

  record(event: AuditEventInput): Promise<void> {
    return this.repository.record(event);
  }

  list() {
    return this.repository.list();
  }

  query(filter: AuditFilter): Promise<readonly AuditEvent[]> {
    return this.repository.query(filter);
  }
}
