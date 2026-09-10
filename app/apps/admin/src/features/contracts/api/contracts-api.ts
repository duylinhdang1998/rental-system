import {
  availabilityResultSchema,
  contractLedgerSchema,
  contractListSchema,
  contractSchema,
  quoteSchema,
  settlementStatementSchema,
  type AvailabilityInput,
  type ContractCancelInput,
  type ContractChargeInput,
  type ContractCreateInput,
  type ContractExtendInput,
  type ContractLedger,
  type ContractListQuery,
  type ContractPaymentInput,
  type ContractReturnInput,
  type ContractSettleInput,
  type ContractSummary,
  type ContractSwapInput,
  type Quote,
  type QuoteInput,
  type RentalContract,
  type SettlementStatement,
} from '@rental/contracts';
import { apiRequest } from '@/shared/api/http';

export interface ContractList {
  items: ContractSummary[];
}

export async function checkAvailability(input: AvailabilityInput) {
  return availabilityResultSchema.parse(
    await apiRequest('/api/contracts/availability', {
      body: JSON.stringify(input),
      method: 'POST',
    }),
  );
}

export async function fetchQuote(input: QuoteInput): Promise<Quote> {
  return quoteSchema.parse(
    await apiRequest('/api/pricing/quote', { body: JSON.stringify(input), method: 'POST' }),
  );
}

export async function createContract(input: ContractCreateInput): Promise<RentalContract> {
  return contractSchema.parse(
    await apiRequest('/api/contracts', { body: JSON.stringify(input), method: 'POST' }),
  );
}

export async function fetchContracts(query: ContractListQuery): Promise<ContractList> {
  const params = new URLSearchParams();
  if (query.search) params.set('search', query.search);
  if (query.status) params.set('status', query.status);
  return contractListSchema.parse(await apiRequest(`/api/contracts?${params.toString()}`));
}

export async function fetchContract(id: string): Promise<RentalContract> {
  return contractSchema.parse(await apiRequest(`/api/contracts/${id}`));
}

export async function fetchSettlement(id: string): Promise<SettlementStatement> {
  return settlementStatementSchema.parse(await apiRequest(`/api/contracts/${id}/settlement`));
}

async function lifecycleRequest(id: string, action: string, body?: object) {
  return contractSchema.parse(
    await apiRequest(`/api/contracts/${id}/${action}`, {
      ...(body ? { body: JSON.stringify(body) } : {}),
      method: 'POST',
    }),
  );
}

export function activateContract(id: string): Promise<RentalContract> {
  return lifecycleRequest(id, 'activate');
}

export function cancelContract(id: string, input: ContractCancelInput): Promise<RentalContract> {
  return lifecycleRequest(id, 'cancel', input);
}

export function extendContract(id: string, input: ContractExtendInput): Promise<RentalContract> {
  return lifecycleRequest(id, 'extend', input);
}

export function swapContract(id: string, input: ContractSwapInput): Promise<RentalContract> {
  return lifecycleRequest(id, 'swap', input);
}

/** Sprint 5: one vehicle at a time; the last open line completes the contract. */
export function returnVehicle(
  id: string,
  lineId: string,
  input: ContractReturnInput,
): Promise<RentalContract> {
  return lifecycleRequest(id, `lines/${lineId}/return`, input);
}

export function addContractCharge(id: string, input: ContractChargeInput): Promise<RentalContract> {
  return lifecycleRequest(id, 'charges', input);
}

export function settleContract(id: string, input: ContractSettleInput): Promise<RentalContract> {
  return lifecycleRequest(id, 'settle', input);
}

/** Sprint 6: immutable ledger rows plus the live balance (FR-08). */
export async function fetchLedger(id: string): Promise<ContractLedger> {
  return contractLedgerSchema.parse(await apiRequest(`/api/contracts/${id}/ledger`));
}

export function recordPayment(id: string, input: ContractPaymentInput): Promise<RentalContract> {
  return lifecycleRequest(id, 'payments', input);
}
