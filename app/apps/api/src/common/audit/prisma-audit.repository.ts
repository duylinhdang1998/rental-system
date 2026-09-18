import { Injectable } from '@nestjs/common';
import type { AuditEvent as AuditEventRow, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service.js';
import type { AuditEvent, AuditEventInput, AuditFilter, AuditRepository } from './audit.types.js';

function toEvent(event: AuditEventRow): AuditEvent {
  return {
    action: event.action,
    actorId: event.actorId,
    at: event.createdAt,
    entityId: event.entityId,
    entityType: event.entityType,
    ...(event.metadata && typeof event.metadata === 'object'
      ? { metadata: event.metadata as Record<string, boolean | null | number | string> }
      : {}),
  };
}

export function auditWhere(filter: AuditFilter): Prisma.AuditEventWhereInput {
  return {
    ...(filter.action ? { action: filter.action } : {}),
    ...(filter.actorId ? { actorId: filter.actorId } : {}),
    ...(filter.entityId ? { entityId: filter.entityId } : {}),
    ...(filter.entityType ? { entityType: filter.entityType } : {}),
    ...(filter.from || filter.to
      ? {
          createdAt: {
            ...(filter.from ? { gte: filter.from } : {}),
            ...(filter.to ? { lte: filter.to } : {}),
          },
        }
      : {}),
  };
}

@Injectable()
export class PrismaAuditRepository implements AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<readonly AuditEvent[]> {
    const events = await this.prisma.auditEvent.findMany({ orderBy: { createdAt: 'asc' } });
    return events.map(toEvent);
  }

  async query(filter: AuditFilter): Promise<readonly AuditEvent[]> {
    const events = await this.prisma.auditEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: filter.limit,
      where: auditWhere(filter),
    });
    return events.map(toEvent);
  }

  async record(event: AuditEventInput): Promise<void> {
    await this.prisma.auditEvent.create({ data: event });
  }
}
