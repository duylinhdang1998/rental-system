import { Inject, Injectable } from '@nestjs/common';
import type { AuthenticatedUser, CustomerInput } from '@rental/contracts';
import { AuditService } from '../../common/audit/audit.service.js';
import { DomainError } from '../../common/errors/domain.error.js';
import { normalizeContact, normalizePhone } from './contact-normalizer.js';
import { CUSTOMER_REPOSITORY } from './customer.tokens.js';
import type { CustomerRepository } from './customer.types.js';
import { PrivateFileService } from './private-file.service.js';

@Injectable()
export class CustomerService {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly repository: CustomerRepository,
    private readonly files: PrivateFileService,
    private readonly audit: AuditService,
  ) {}

  async create(input: CustomerInput, actor: AuthenticatedUser) {
    const created = await this.repository.create(input);
    await this.audit.record({
      action: 'CUSTOMER_CREATED',
      actorId: actor.id,
      entityId: created.id,
      entityType: 'Customer',
    });
    return created;
  }

  async list(search?: string) {
    return { items: await this.repository.list(search) };
  }

  async duplicates(phone: string) {
    return { items: await this.repository.findDuplicates(normalizePhone(phone)) };
  }

  async documentAccess(customerId: string, documentId: string, actor: AuthenticatedUser) {
    const document = await this.repository.findDocument(customerId, documentId);
    if (!document) throw new DomainError('NOT_FOUND', 'Không tìm thấy tài liệu khách hàng');
    await this.audit.record({
      action: 'CUSTOMER_DOCUMENT_ACCESSED',
      actorId: actor.id,
      entityId: document.id,
      entityType: 'CustomerDocument',
    });
    return this.files.createAccess(document.objectKey);
  }

  normalizeInput(input: CustomerInput): CustomerInput {
    return {
      ...input,
      contacts: input.contacts.map((contact) => ({
        ...contact,
        value: normalizeContact(contact.type, contact.value),
      })),
    };
  }
}
