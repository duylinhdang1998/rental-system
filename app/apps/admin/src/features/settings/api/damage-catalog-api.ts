import {
  damageItemListSchema,
  damageItemSchema,
  type DamageItem,
  type DamageItemInput,
  type DamageItemList,
  type DamageItemUpdateInput,
} from '@rental/contracts';
import { apiRequest } from '@/shared/api/http';

export async function fetchDamageItems(includeInactive: boolean): Promise<DamageItemList> {
  return damageItemListSchema.parse(
    await apiRequest(`/api/catalog/damage-items?includeInactive=${includeInactive}`),
  );
}

export async function createDamageItem(input: DamageItemInput): Promise<DamageItem> {
  return damageItemSchema.parse(
    await apiRequest('/api/catalog/damage-items', {
      body: JSON.stringify(input),
      method: 'POST',
    }),
  );
}

export async function updateDamageItem(
  id: string,
  patch: DamageItemUpdateInput,
): Promise<DamageItem> {
  return damageItemSchema.parse(
    await apiRequest(`/api/catalog/damage-items/${id}`, {
      body: JSON.stringify(patch),
      method: 'PATCH',
    }),
  );
}
