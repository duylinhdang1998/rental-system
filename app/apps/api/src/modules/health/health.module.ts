import { type DynamicModule, Module, type Provider } from '@nestjs/common';
import { ENVIRONMENT } from '../../config/configuration.js';
import type { Environment } from '../../config/environment.js';
import { PrismaService } from '../../database/prisma.service.js';
import { DATABASE_PROBE, DemoDatabaseProbe, PrismaDatabaseProbe } from './database.probe.js';
import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';

function probeProviders(environment: Environment): Provider[] {
  if (environment.DEMO_MODE) return [{ provide: DATABASE_PROBE, useClass: DemoDatabaseProbe }];
  return [PrismaService, { provide: DATABASE_PROBE, useClass: PrismaDatabaseProbe }];
}

@Module({})
export class HealthModule {
  static register(environment: Environment): DynamicModule {
    return {
      controllers: [HealthController],
      module: HealthModule,
      providers: [
        { provide: ENVIRONMENT, useValue: environment },
        ...probeProviders(environment),
        HealthService,
      ],
    };
  }
}
