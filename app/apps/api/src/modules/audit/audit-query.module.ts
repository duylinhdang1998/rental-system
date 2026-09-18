import { Module } from '@nestjs/common';
import { AuditQueryService } from './audit-query.service.js';
import { AuditController } from './audit.controller.js';

/** Reads the global audit repository; writing stays with each business service. */
@Module({ controllers: [AuditController], providers: [AuditQueryService] })
export class AuditQueryModule {}
