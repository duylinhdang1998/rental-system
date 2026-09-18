import { type DynamicModule, Module, type Provider } from '@nestjs/common';
import type { Environment } from '../../config/environment.js';
import { PrismaService } from '../../database/prisma.service.js';
import { DemoEconomicsRepository } from './demo-economics.repository.js';
import { ECONOMICS_REPOSITORY } from './economics.tokens.js';
import { ExpenseController } from './expense.controller.js';
import { ExpenseService } from './expense.service.js';
import { FleetEconomicsController } from './fleet-economics.controller.js';
import { FleetEconomicsExportService } from './fleet-economics-export.service.js';
import { FleetEconomicsService } from './fleet-economics.service.js';
import { PrismaEconomicsRepository } from './prisma-economics.repository.js';
import { VehicleAcquisitionController } from './vehicle-acquisition.controller.js';
import { VehicleAcquisitionService } from './vehicle-acquisition.service.js';

function providers(environment: Environment): Provider[] {
  if (environment.DEMO_MODE) {
    return [{ provide: ECONOMICS_REPOSITORY, useClass: DemoEconomicsRepository }];
  }
  return [PrismaService, { provide: ECONOMICS_REPOSITORY, useClass: PrismaEconomicsRepository }];
}

/**
 * Sprint 11 asset economics. It imports the *same* contract module instance the application
 * registered so revenue attribution reads the shared repository (demo or Prisma).
 */
@Module({})
export class EconomicsModule {
  static register(environment: Environment, contracts: DynamicModule): DynamicModule {
    return {
      controllers: [ExpenseController, VehicleAcquisitionController, FleetEconomicsController],
      imports: [contracts],
      module: EconomicsModule,
      providers: [
        ...providers(environment),
        ExpenseService,
        VehicleAcquisitionService,
        FleetEconomicsService,
        FleetEconomicsExportService,
      ],
    };
  }
}
