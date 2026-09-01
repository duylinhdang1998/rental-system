import { type DynamicModule, Module, type Provider } from '@nestjs/common';
import type { Environment } from '../../config/environment.js';
import { PrismaService } from '../../database/prisma.service.js';
import { DemoPricingRepository } from './demo-pricing.repository.js';
import { PricingController } from './pricing.controller.js';
import { PricingService } from './pricing.service.js';
import { PRICING_REPOSITORY } from './pricing.tokens.js';
import { PrismaPricingRepository } from './prisma-pricing.repository.js';

function providers(environment: Environment): Provider[] {
  if (environment.DEMO_MODE)
    return [{ provide: PRICING_REPOSITORY, useClass: DemoPricingRepository }];
  return [PrismaService, { provide: PRICING_REPOSITORY, useClass: PrismaPricingRepository }];
}

@Module({})
export class PricingModule {
  static register(environment: Environment): DynamicModule {
    return {
      controllers: [PricingController],
      exports: [PricingService],
      module: PricingModule,
      providers: [...providers(environment), PricingService],
    };
  }
}
