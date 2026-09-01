import { type DynamicModule, Global, Module, type Provider } from '@nestjs/common';
import type { Environment } from '../../config/environment.js';
import { PrismaService } from '../../database/prisma.service.js';
import { AUDIT_REPOSITORY } from './audit.tokens.js';
import { AuditService } from './audit.service.js';
import { DemoAuditRepository } from './demo-audit.repository.js';
import { PrismaAuditRepository } from './prisma-audit.repository.js';

function providers(environment: Environment): Provider[] {
  if (environment.DEMO_MODE) return [{ provide: AUDIT_REPOSITORY, useClass: DemoAuditRepository }];
  return [PrismaService, { provide: AUDIT_REPOSITORY, useClass: PrismaAuditRepository }];
}

@Global()
@Module({})
export class AuditModule {
  static register(environment: Environment): DynamicModule {
    return {
      exports: [AuditService],
      module: AuditModule,
      providers: [...providers(environment), AuditService],
    };
  }
}
