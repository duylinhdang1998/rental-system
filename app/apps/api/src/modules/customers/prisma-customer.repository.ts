import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { CustomerInput, CustomerSummary } from '@rental/contracts';
import { PrismaService } from '../../database/prisma.service.js';
import { normalizeContact } from './contact-normalizer.js';
import type { CustomerDocumentRecord, CustomerRepository } from './customer.types.js';

const CUSTOMER_INCLUDE = { contacts: true, tags: true } as const;
type CustomerWithRelations = Prisma.CustomerGetPayload<{ include: typeof CUSTOMER_INCLUDE }>;

@Injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CustomerInput): Promise<CustomerSummary> {
    const item = await this.prisma.customer.create({
      data: {
        contacts: {
          create: input.contacts.map((contact) => ({
            ...contact,
            normalizedValue: normalizeContact(contact.type, contact.value),
          })),
        },
        name: input.name,
        nationality: input.nationality,
        tags: { create: input.tags },
      },
      include: CUSTOMER_INCLUDE,
    });
    return this.toSummary(item);
  }

  async findDocument(
    customerId: string,
    documentId: string,
  ): Promise<CustomerDocumentRecord | null> {
    const item = await this.prisma.customerDocument.findFirst({
      where: { customerId, id: documentId },
    });
    return item
      ? { customerId: item.customerId, id: item.id, label: item.label, objectKey: item.objectKey }
      : null;
  }

  async findDuplicates(normalizedContact: string): Promise<CustomerSummary[]> {
    const items = await this.prisma.customer.findMany({
      include: CUSTOMER_INCLUDE,
      where: { contacts: { some: { normalizedValue: normalizedContact } } },
    });
    return items.map((item) => this.toSummary(item));
  }

  async list(search?: string): Promise<CustomerSummary[]> {
    const items = await this.prisma.customer.findMany({
      include: CUSTOMER_INCLUDE,
      orderBy: { name: 'asc' },
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { contacts: { some: { value: { contains: search, mode: 'insensitive' } } } },
            ],
          }
        : {},
    });
    return items.map((item) => this.toSummary(item));
  }

  private toSummary(item: CustomerWithRelations): CustomerSummary {
    const warning = item.tags.find((tag) => tag.code === 'BLACKLIST');
    return {
      contacts: item.contacts.map((contact) => ({
        primary: contact.primary,
        type: contact.type,
        value: contact.value,
      })),
      createdAt: item.createdAt.toISOString(),
      id: item.id,
      name: item.name,
      nationality: item.nationality,
      ...(warning ? { warning: { code: warning.code, reason: warning.reason } } : {}),
    };
  }
}
