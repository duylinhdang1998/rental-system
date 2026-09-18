import { Inject, Injectable } from '@nestjs/common';
import type {
  AuthenticatedUser,
  DamageItem,
  DamageItemInput,
  DamageItemList,
  DamageItemUpdateInput,
} from '@rental/contracts';
import { AuditService } from '../../common/audit/audit.service.js';
import { DomainError } from '../../common/errors/domain.error.js';
import { DAMAGE_CATALOG_REPOSITORY } from './damage-catalog.tokens.js';
import type { DamageCatalogRepository } from './damage-catalog.types.js';

/** US-026: the Owner prices damage once; Staff only reads the active list. */
@Injectable()
export class DamageCatalogService {
  constructor(
    @Inject(DAMAGE_CATALOG_REPOSITORY) private readonly catalog: DamageCatalogRepository,
    private readonly audit: AuditService,
  ) {}

  async list(actor: AuthenticatedUser, includeInactive: boolean): Promise<DamageItemList> {
    const items = await this.catalog.list(includeInactive && actor.role === 'OWNER');
    return { items };
  }

  async create(input: DamageItemInput, actor: AuthenticatedUser): Promise<DamageItem> {
    const item = await this.catalog.create(input);
    await this.audit.record({
      action: 'DAMAGE_ITEM_CREATED',
      actorId: actor.id,
      entityId: item.id,
      entityType: 'DamageItem',
      metadata: { code: item.code, priceVnd: item.priceVnd },
    });
    return item;
  }

  async update(
    id: string,
    input: DamageItemUpdateInput,
    actor: AuthenticatedUser,
  ): Promise<DamageItem> {
    const before = await this.catalog.findById(id);
    if (!before) throw new DomainError('DAMAGE_ITEM_NOT_FOUND', 'Không tìm thấy hạng mục hư hỏng');
    const after = await this.catalog.update(id, input);
    await this.audit.record({
      action: 'DAMAGE_ITEM_UPDATED',
      actorId: actor.id,
      entityId: after.id,
      entityType: 'DamageItem',
      metadata: {
        active: after.active,
        afterPriceVnd: after.priceVnd,
        beforePriceVnd: before.priceVnd,
        code: after.code,
      },
    });
    return after;
  }
}
