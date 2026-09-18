import { Inject, Injectable } from '@nestjs/common';
import type { CashShiftExpectation } from '@rental/contracts';
import { CONTRACT_REPOSITORY } from '../contracts/contract.tokens.js';
import type { ContractRepository } from '../contracts/contract.types.js';
import { ECONOMICS_REPOSITORY } from '../economics/economics.tokens.js';
import type { EconomicsRepository } from '../economics/economics.types.js';
import { buildExpectation, cashMovements } from './cash-shift.policy.js';
import type { CashShiftRecord } from './cash-shift.types.js';

/** Reads the two ledgers through their ports; nothing about cash is stored twice (BR-10). */
@Injectable()
export class CashExpectationService {
  constructor(
    @Inject(CONTRACT_REPOSITORY) private readonly contracts: ContractRepository,
    @Inject(ECONOMICS_REPOSITORY) private readonly economics: EconomicsRepository,
  ) {}

  async expectation(shift: CashShiftRecord, asOf: Date): Promise<CashShiftExpectation> {
    const window = { endAt: asOf.getTime(), startAt: Date.parse(shift.openedAt) };
    const [contracts, expenses] = await Promise.all([
      this.contracts.listFinancial(),
      this.economics.listExpenses({}),
    ]);
    return buildExpectation(shift, cashMovements(contracts, expenses, window), asOf);
  }
}
