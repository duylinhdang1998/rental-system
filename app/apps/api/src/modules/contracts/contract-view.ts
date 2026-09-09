import type { ContractListQuery, ContractSummary, RentalContract } from '@rental/contracts';
import { DomainError } from '../../common/errors/domain.error.js';
import { activeLines } from './contract-lifecycle.policy.js';
import type { ContractRepository } from './contract.types.js';

export async function requireContract(
  repository: ContractRepository,
  id: string,
): Promise<RentalContract> {
  const contract = await repository.findById(id);
  if (!contract) throw new DomainError('NOT_FOUND', 'Không tìm thấy hợp đồng');
  return contract;
}

export function contractSummary(contract: RentalContract): ContractSummary {
  return {
    code: contract.code,
    createdAt: contract.createdAt,
    customerName: contract.quote.customerName,
    endAt: contract.quote.endAt,
    id: contract.id,
    startAt: contract.quote.startAt,
    status: contract.status,
    totalVnd: contract.quote.totalVnd,
    vehicleCodes: activeLines(contract.quote.lines).map((line) => line.vehicleCode),
  };
}

export function matchesContractQuery(summary: ContractSummary, query: ContractListQuery): boolean {
  if (query.status && summary.status !== query.status) return false;
  const search = query.search?.trim().toLowerCase();
  if (!search) return true;
  const haystack = [summary.code, summary.customerName, ...summary.vehicleCodes]
    .join(' ')
    .toLowerCase();
  return haystack.includes(search);
}

export function sortNewestFirst(items: ContractSummary[]): ContractSummary[] {
  return [...items].sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
}
