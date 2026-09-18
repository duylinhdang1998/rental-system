import { Inject, Injectable } from '@nestjs/common';
import type { ContractChargeInput, ContractEventMetadata } from '@rental/contracts';
import { DomainError } from '../../common/errors/domain.error.js';
import { DAMAGE_CATALOG_REPOSITORY } from '../damage-catalog/damage-catalog.tokens.js';
import type { DamageCatalogRepository } from '../damage-catalog/damage-catalog.types.js';

export type PricedChargeInput = Pick<
  ContractChargeInput,
  'amountVnd' | 'damageItemId' | 'description'
>;

export interface PricedCharge {
  amountVnd: number;
  description: string;
  metadata?: ContractEventMetadata;
}

/**
 * US-026: a charge that names a catalog item copies the item's price and name at that moment,
 * so later price changes never rewrite an existing contract; free text stays allowed.
 */
@Injectable()
export class ChargePricingService {
  constructor(
    @Inject(DAMAGE_CATALOG_REPOSITORY) private readonly catalog: DamageCatalogRepository,
  ) {}

  async price(input: PricedChargeInput): Promise<PricedCharge> {
    if (input.damageItemId === undefined) return freeText(input);
    const item = await this.catalog.findById(input.damageItemId);
    if (!item) throw new DomainError('DAMAGE_ITEM_NOT_FOUND', 'Không tìm thấy hạng mục hư hỏng');
    if (!item.active)
      throw new DomainError('DAMAGE_ITEM_INACTIVE', 'Hạng mục hư hỏng đã ngừng dùng');
    if (item.priceVnd === 0) throw new DomainError('INVALID_INPUT', 'Hạng mục hư hỏng chưa có giá');
    return {
      amountVnd: item.priceVnd,
      description: item.name,
      metadata: { damageItemCode: item.code, damageItemId: item.id },
    };
  }
}

function freeText(input: PricedChargeInput): PricedCharge {
  if (input.amountVnd === undefined || input.description === undefined) {
    throw new DomainError('INVALID_INPUT', 'Chọn hạng mục hư hỏng hoặc nhập số tiền và nội dung');
  }
  return { amountVnd: input.amountVnd, description: input.description };
}
