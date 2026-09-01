import {
  customerListSchema,
  customerSummarySchema,
  type CustomerInput,
  type CustomerSummary,
} from '@rental/contracts';
import { apiRequest } from '@/shared/api/http';

export async function fetchCustomers(search?: string): Promise<{ items: CustomerSummary[] }> {
  const query = new URLSearchParams();
  if (search) query.set('search', search);
  return customerListSchema.parse(await apiRequest(`/api/customers?${query.toString()}`));
}

export async function createCustomer(input: CustomerInput): Promise<CustomerSummary> {
  const payload = await apiRequest('/api/customers', {
    body: JSON.stringify(input),
    method: 'POST',
  });
  return customerSummarySchema.parse(payload);
}

export async function fetchDuplicates(phone: string): Promise<{ items: CustomerSummary[] }> {
  const payload = await apiRequest(`/api/customers/duplicates?phone=${encodeURIComponent(phone)}`);
  return customerListSchema.parse(payload);
}
