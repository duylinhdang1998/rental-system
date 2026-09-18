import type { DamageItem, DamageItemInput, DamageItemUpdateInput } from '@rental/contracts';

export type DamageItemDraft = DamageItemInput;
export type DamageItemPatch = DamageItemUpdateInput;

export interface DamageCatalogRepository {
  /** A duplicate code is DAMAGE_ITEM_EXISTS, never an update. */
  create(draft: DamageItemDraft): Promise<DamageItem>;
  findById(id: string): Promise<DamageItem | null>;
  /** Sorted by code; inactive items only when asked. */
  list(includeInactive: boolean): Promise<DamageItem[]>;
  update(id: string, patch: DamageItemPatch): Promise<DamageItem>;
}
