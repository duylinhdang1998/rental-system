import { Inject, Injectable } from '@nestjs/common';
import type { ReceivableList } from '@rental/contracts';
import { CONTRACT_REPOSITORY } from '../contracts/contract.tokens.js';
import type { ContractRepository } from '../contracts/contract.types.js';
import { receivableList } from './receivable.policy.js';

/** Operational debt list: open to Staff so they can collect (aggregates of revenue stay Owner-only). */
@Injectable()
export class ReceivableService {
  constructor(@Inject(CONTRACT_REPOSITORY) private readonly repository: ContractRepository) {}

  async list(now = new Date()): Promise<ReceivableList> {
    return receivableList(await this.repository.listFinancial(), now);
  }
}
