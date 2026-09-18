import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { auditQuerySchema, type AuditList, type AuditQuery } from '@rental/contracts';
import { AuthenticationGuard } from '../../common/guards/authentication.guard.js';
import { OwnerAuthorizationGuard } from '../../common/guards/authorization.guard.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { AuditQueryService } from './audit-query.service.js';

/** The audit trail names actors and money; it is Owner-only at the API, not just in the UI. */
@Controller('audit')
@UseGuards(AuthenticationGuard, OwnerAuthorizationGuard)
export class AuditController {
  constructor(private readonly service: AuditQueryService) {}

  @Get()
  list(@Query(new ZodValidationPipe(auditQuerySchema)) query: AuditQuery): Promise<AuditList> {
    return this.service.list(query);
  }
}
