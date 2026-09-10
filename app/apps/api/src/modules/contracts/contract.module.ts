import { type DynamicModule, Module, type Provider } from '@nestjs/common';
import type { Environment } from '../../config/environment.js';
import { PrismaService } from '../../database/prisma.service.js';
import { PricingModule } from '../pricing/pricing.module.js';
import { ContractBoardService } from './contract-board.service.js';
import { ContractController } from './contract.controller.js';
import { ContractExtensionService } from './contract-extension.service.js';
import { ContractSwapService } from './contract-swap.service.js';
import { ContractLifecycleController } from './contract-lifecycle.controller.js';
import { ContractLifecycleService } from './contract-lifecycle.service.js';
import { ContractPdfService } from './contract-pdf.service.js';
import { ContractReturnController } from './contract-return.controller.js';
import { ContractReturnService } from './contract-return.service.js';
import { ContractSettlementService } from './contract-settlement.service.js';
import { ContractService } from './contract.service.js';
import {
  CONTRACT_REPOSITORY,
  DEMO_CONTRACT_SEEDS,
  OVERDUE_SCHEDULER_ENABLED,
} from './contract.tokens.js';
import { DemoContractRepository } from './demo-contract.repository.js';
import { demoContractSeeds } from './demo-contract.seed.js';
import { OverdueScheduler } from './overdue-scheduler.js';
import { PrismaContractRepository } from './prisma-contract.repository.js';
import { VehicleSyncService } from './vehicle-sync.service.js';

function repositoryProviders(environment: Environment): Provider[] {
  if (environment.DEMO_MODE) {
    const seeds = environment.NODE_ENV === 'test' ? [] : demoContractSeeds(new Date());
    return [
      { provide: DEMO_CONTRACT_SEEDS, useValue: seeds },
      { provide: CONTRACT_REPOSITORY, useClass: DemoContractRepository },
    ];
  }
  return [PrismaService, { provide: CONTRACT_REPOSITORY, useClass: PrismaContractRepository }];
}

@Module({})
export class ContractModule {
  static register(environment: Environment): DynamicModule {
    return {
      controllers: [ContractController, ContractLifecycleController, ContractReturnController],
      imports: [PricingModule.register(environment)],
      module: ContractModule,
      providers: [
        ...repositoryProviders(environment),
        { provide: OVERDUE_SCHEDULER_ENABLED, useValue: environment.NODE_ENV !== 'test' },
        ContractPdfService,
        ContractService,
        VehicleSyncService,
        ContractLifecycleService,
        ContractExtensionService,
        ContractSwapService,
        ContractBoardService,
        ContractReturnService,
        ContractSettlementService,
        OverdueScheduler,
      ],
    };
  }
}
