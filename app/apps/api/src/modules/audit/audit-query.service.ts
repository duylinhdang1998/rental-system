import { Injectable } from '@nestjs/common';
import type { AuditList, AuditQuery } from '@rental/contracts';
import { AuditService } from '../../common/audit/audit.service.js';
import { EmployeeDirectory } from '../auth/employee-directory.js';
import { auditFilterFrom } from './audit-query.policy.js';

/** US-020: the Owner reads who changed what, when and with which before/after values. */
@Injectable()
export class AuditQueryService {
  constructor(
    private readonly audit: AuditService,
    private readonly directory: EmployeeDirectory,
  ) {}

  async list(query: AuditQuery): Promise<AuditList> {
    const events = await this.audit.query(auditFilterFrom(query));
    const names = await this.directory.names(events.map((event) => event.actorId));
    return {
      count: events.length,
      items: events.map((event) => ({
        action: event.action,
        actorId: event.actorId,
        actorName: names.get(event.actorId) ?? event.actorId,
        at: event.at.toISOString(),
        entityId: event.entityId,
        entityType: event.entityType,
        ...(event.metadata ? { metadata: event.metadata } : {}),
      })),
    };
  }
}
