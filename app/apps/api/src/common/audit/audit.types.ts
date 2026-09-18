export interface AuditEvent {
  action: string;
  actorId: string;
  at: Date;
  entityId: string;
  entityType: string;
  metadata?: Record<string, boolean | null | number | string>;
}

export type AuditEventInput = Omit<AuditEvent, 'at'>;

/** Owner audit view filters; `from`/`to` are absolute instants resolved from business days. */
export interface AuditFilter {
  action?: string;
  actorId?: string;
  entityId?: string;
  entityType?: string;
  from?: Date;
  limit: number;
  to?: Date;
}

export interface AuditRepository {
  list(): Promise<readonly AuditEvent[]>;
  query(filter: AuditFilter): Promise<readonly AuditEvent[]>;
  record(event: AuditEventInput): Promise<void>;
}
