import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { CustomerInput, CustomerSummary } from '@rental/contracts';
import { normalizeContact } from './contact-normalizer.js';
import type { CustomerDocumentRecord, CustomerRepository } from './customer.types.js';

interface StoredCustomer extends CustomerSummary {
  normalizedContacts: string[];
}

const RISK_CUSTOMER: StoredCustomer = {
  contacts: [{ primary: true, type: 'PHONE', value: '0909 123 456' }],
  id: 'demo-risk',
  name: 'Risk Fixture',
  nationality: 'VN',
  normalizedContacts: ['+84909123456'],
  warning: { code: 'BLACKLIST', reason: 'Synthetic risk fixture' },
};

const SAFE_CUSTOMERS: StoredCustomer[] = [
  {
    contacts: [{ primary: true, type: 'PHONE', value: '0900 000 001' }],
    id: 'demo-customer',
    name: 'Khách hàng mẫu',
    nationality: 'VN',
    normalizedContacts: ['+84900000001'],
  },
  {
    contacts: [{ primary: true, type: 'PHONE', value: '0900 000 002' }],
    id: 'demo-vip',
    name: 'Khách VIP mẫu',
    nationality: 'VN',
    normalizedContacts: ['+84900000002'],
  },
];

@Injectable()
export class DemoCustomerRepository implements CustomerRepository {
  private readonly customers: StoredCustomer[] = [
    ...structuredClone(SAFE_CUSTOMERS),
    structuredClone(RISK_CUSTOMER),
  ];
  private readonly documents: CustomerDocumentRecord[] = [
    {
      customerId: 'demo-risk',
      id: 'demo-doc',
      label: 'Giấy tờ tùy thân',
      objectKey: 'private/demo-risk/id.jpg',
    },
  ];

  create(input: CustomerInput): Promise<CustomerSummary> {
    const customer: StoredCustomer = {
      contacts: input.contacts,
      id: randomUUID(),
      name: input.name,
      nationality: input.nationality,
      normalizedContacts: input.contacts.map((item) => normalizeContact(item.type, item.value)),
      warning: input.tags.find((tag) => tag.code === 'BLACKLIST'),
    };
    this.customers.push(customer);
    return Promise.resolve(this.summary(customer));
  }

  findDocument(customerId: string, documentId: string): Promise<CustomerDocumentRecord | null> {
    return Promise.resolve(
      this.documents.find((item) => item.customerId === customerId && item.id === documentId) ??
        null,
    );
  }

  findDuplicates(normalizedContact: string): Promise<CustomerSummary[]> {
    return Promise.resolve(
      this.customers
        .filter((item) => item.normalizedContacts.includes(normalizedContact))
        .map(this.summary),
    );
  }

  list(search?: string): Promise<CustomerSummary[]> {
    const query = search?.toLowerCase();
    return Promise.resolve(
      this.customers
        .filter(
          (item) =>
            !query ||
            `${item.name} ${item.contacts.map((contact) => contact.value).join(' ')}`
              .toLowerCase()
              .includes(query),
        )
        .map(this.summary),
    );
  }

  private readonly summary = (customer: StoredCustomer): CustomerSummary => ({
    contacts: structuredClone(customer.contacts),
    id: customer.id,
    name: customer.name,
    nationality: customer.nationality,
    ...(customer.warning ? { warning: { ...customer.warning } } : {}),
  });
}
