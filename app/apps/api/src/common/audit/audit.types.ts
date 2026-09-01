export interface AuditEvent {
  action: string;
  actorId: string;
  at: Date;
  entityId: string;
  entityType: string;
}

export type AuditEventInput = Omit<AuditEvent, 'at'>;

export interface AuditRepository {
  list(): Promise<readonly AuditEvent[]>;
  record(event: AuditEventInput): Promise<void>;
}
