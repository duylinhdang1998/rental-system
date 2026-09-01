import {
  availabilityResultSchema,
  contractSchema,
  quoteSchema,
  type AvailabilityInput,
  type ContractCreateInput,
  type Quote,
  type QuoteInput,
  type RentalContract,
} from '@rental/contracts';
import { apiRequest } from '../../../shared/api/http';

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
