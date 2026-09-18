import { type DynamicModule, Module, type Provider } from '@nestjs/common';
import type { Environment } from '../../config/environment.js';
import { PrismaService } from '../../database/prisma.service.js';
import { DamageCatalogController } from './damage-catalog.controller.js';
import { DamageCatalogService } from './damage-catalog.service.js';
import { DAMAGE_CATALOG_REPOSITORY } from './damage-catalog.tokens.js';
import { DemoDamageCatalogRepository } from './demo-damage-catalog.repository.js';
import { PrismaDamageCatalogRepository } from './prisma-damage-catalog.repository.js';

function providers(environment: Environment): Provider[] {
  if (environment.DEMO_MODE) {
    return [{ provide: DAMAGE_CATALOG_REPOSITORY, useClass: DemoDamageCatalogRepository }];
  }
  return [
    PrismaService,
    { provide: DAMAGE_CATALOG_REPOSITORY, useClass: PrismaDamageCatalogRepository },
  ];
}

/** Global so the contract module prices charges without importing this module explicitly. */
@Module({})
export class DamageCatalogModule {
  static register(environment: Environment): DynamicModule {
    return {
      controllers: [DamageCatalogController],
      exports: [DAMAGE_CATALOG_REPOSITORY],
      global: true,
      module: DamageCatalogModule,
      providers: [...providers(environment), DamageCatalogService],
    };
  }
}
