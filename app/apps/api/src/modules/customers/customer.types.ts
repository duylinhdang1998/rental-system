import type { CustomerInput, CustomerSummary } from '@rental/contracts';

export interface CustomerDocumentRecord {
  customerId: string;
  id: string;
  label: string;
  objectKey: string;
}

export interface CustomerRepository {
  create(input: CustomerInput): Promise<CustomerSummary>;
  findDocument(customerId: string, documentId: string): Promise<CustomerDocumentRecord | null>;
  findDuplicates(normalizedContact: string): Promise<CustomerSummary[]>;
  list(search?: string): Promise<CustomerSummary[]>;
}
