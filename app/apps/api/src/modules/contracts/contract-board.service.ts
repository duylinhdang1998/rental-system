import { Inject, Injectable } from '@nestjs/common';
import type { ContractListQuery, ContractSummary, OperationsBoard } from '@rental/contracts';
import { FLEET_REPOSITORY } from '../fleet/fleet.tokens.js';
import type { FleetRepository } from '../fleet/fleet.types.js';
import { CONTRACT_REPOSITORY } from './contract.tokens.js';
import type { ContractRepository } from './contract.types.js';
import { buildBoard } from './operations-board.policy.js';

@Injectable()
export class ContractBoardService {
  constructor(
    @Inject(CONTRACT_REPOSITORY) private readonly repository: ContractRepository,
    @Inject(FLEET_REPOSITORY) private readonly fleet: FleetRepository,
  ) {}

  async list(query: ContractListQuery): Promise<{ items: ContractSummary[] }> {
    return { items: await this.repository.list(query) };
  }

  /** Read-only daily board evaluated in Asia/Ho_Chi_Minh business time. */
  async board(now = new Date()): Promise<OperationsBoard> {
    const [contracts, vehicles] = await Promise.all([
      this.repository.listOpen(),
      this.fleet.listVehicles({}),
    ]);
    return buildBoard(contracts, vehicles, now);
  }
}
