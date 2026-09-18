import { type DynamicModule, Module, type Provider } from '@nestjs/common';
import type { Environment } from '../../config/environment.js';
import { PrismaService } from '../../database/prisma.service.js';
import { CashExpectationService } from './cash-expectation.service.js';
import { CashShiftController } from './cash-shift.controller.js';
import { CashShiftService } from './cash-shift.service.js';
import { CASH_SHIFT_REPOSITORY } from './cash-shift.tokens.js';
import { DemoCashShiftRepository } from './demo-cash-shift.repository.js';
import { PrismaCashShiftRepository } from './prisma-cash-shift.repository.js';

function providers(environment: Environment): Provider[] {
  if (environment.DEMO_MODE) {
    return [{ provide: CASH_SHIFT_REPOSITORY, useClass: DemoCashShiftRepository }];
  }
  return [PrismaService, { provide: CASH_SHIFT_REPOSITORY, useClass: PrismaCashShiftRepository }];
}

/**
 * Sprint 12 cash shifts. It imports the *same* contract and economics module instances the
 * application registered, so expected cash reads the shared ledgers (demo or Prisma).
 */
@Module({})
export class CashShiftModule {
  static register(
    environment: Environment,
    contracts: DynamicModule,
    economics: DynamicModule,
  ): DynamicModule {
    return {
      controllers: [CashShiftController],
      imports: [contracts, economics],
      module: CashShiftModule,
      providers: [...providers(environment), CashExpectationService, CashShiftService],
    };
  }
}
