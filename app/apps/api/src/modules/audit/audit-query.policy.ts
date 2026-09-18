import type { AuditQuery } from '@rental/contracts';
import type { AuditFilter } from '../../common/audit/audit.types.js';

/** Business days are Asia/Ho_Chi_Minh; `to` is inclusive so "today" covers the whole day. */
const BUSINESS_OFFSET = '+07:00';

export function auditFilterFrom(query: AuditQuery): AuditFilter {
  return {
    ...(query.action ? { action: query.action } : {}),
    ...(query.actorId ? { actorId: query.actorId } : {}),
    ...(query.entityId ? { entityId: query.entityId } : {}),
    ...(query.entityType ? { entityType: query.entityType } : {}),
    ...(query.from ? { from: new Date(`${query.from}T00:00:00.000${BUSINESS_OFFSET}`) } : {}),
    ...(query.to ? { to: new Date(`${query.to}T23:59:59.999${BUSINESS_OFFSET}`) } : {}),
    limit: query.limit,
  };
}
