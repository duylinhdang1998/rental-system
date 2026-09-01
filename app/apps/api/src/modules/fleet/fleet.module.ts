import { type DynamicModule, Module, type Provider } from '@nestjs/common';
import type { Environment } from '../../config/environment.js';
import { PrismaService } from '../../database/prisma.service.js';
import { DemoFleetRepository } from './demo-fleet.repository.js';
import { FleetController } from './fleet.controller.js';
import { FleetService } from './fleet.service.js';
import { FLEET_REPOSITORY } from './fleet.tokens.js';
import { PrismaFleetRepository } from './prisma-fleet.repository.js';

function providers(environment: Environment): Provider[] {
  if (environment.DEMO_MODE) return [{ provide: FLEET_REPOSITORY, useClass: DemoFleetRepository }];
  return [PrismaService, { provide: FLEET_REPOSITORY, useClass: PrismaFleetRepository }];
}

@Module({})
export class FleetModule {
  static register(environment: Environment): DynamicModule {
    return {
      controllers: [FleetController],
      module: FleetModule,
      providers: [...providers(environment), FleetService],
    };
  }
}
