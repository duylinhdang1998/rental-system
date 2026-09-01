import { type DynamicModule, Module, type Provider } from '@nestjs/common';
import type { Environment } from '../../config/environment.js';
import { PrismaService } from '../../database/prisma.service.js';
import { PricingModule } from '../pricing/pricing.module.js';
import { ContractController } from './contract.controller.js';
import { ContractPdfService } from './contract-pdf.service.js';
import { ContractService } from './contract.service.js';
import { CONTRACT_REPOSITORY } from './contract.tokens.js';
import { DemoContractRepository } from './demo-contract.repository.js';
import { PrismaContractRepository } from './prisma-contract.repository.js';

function providers(environment: Environment): Provider[] {
  if (environment.DEMO_MODE)
    return [{ provide: CONTRACT_REPOSITORY, useClass: DemoContractRepository }];
  return [PrismaService, { provide: CONTRACT_REPOSITORY, useClass: PrismaContractRepository }];
}

@Module({})
export class ContractModule {
  static register(environment: Environment): DynamicModule {
    return {
      controllers: [ContractController],
      imports: [PricingModule.register(environment)],
      module: ContractModule,
      providers: [...providers(environment), ContractPdfService, ContractService],
    };
  }
}
