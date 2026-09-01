import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import type { AuditEvent, AuditEventInput, AuditRepository } from './audit.types.js';

@Injectable()
export class PrismaAuditRepository implements AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<readonly AuditEvent[]> {
    const events = await this.prisma.auditEvent.findMany({ orderBy: { createdAt: 'asc' } });
    return events.map((event) => ({
      action: event.action,
      actorId: event.actorId,
      at: event.createdAt,
      entityId: event.entityId,
      entityType: event.entityType,
    }));
  }

  async record(event: AuditEventInput): Promise<void> {
    await this.prisma.auditEvent.create({ data: event });
  }
}
