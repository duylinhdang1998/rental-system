import {
  availabilityResultSchema,
  contractListSchema,
  contractSchema,
  quoteSchema,
  type AvailabilityInput,
  type ContractCancelInput,
  type ContractCreateInput,
  type ContractExtendInput,
  type ContractListQuery,
  type ContractSummary,
  type ContractSwapInput,
  type Quote,
  type QuoteInput,
  type RentalContract,
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

export function completeContract(id: string): Promise<RentalContract> {
  return lifecycleRequest(id, 'complete');
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
