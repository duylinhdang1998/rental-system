import type { DamageItem, DamageItemInput, DamageItemUpdateInput } from '@rental/contracts';

export interface DamageItemFormValues {
  active: boolean;
  code: string;
  name: string;
  priceVnd: string;
}

const MIN_CODE_LENGTH = 2;
const MIN_NAME_LENGTH = 2;
const MAX_PRICE_VND = 1_000_000_000;
const NON_NEGATIVE_INTEGER = /^\d+$/;

export const INITIAL_DAMAGE_ITEM_FORM: DamageItemFormValues = {
  active: true,
  code: '',
  name: '',
  priceVnd: '',
};

/** Seeds the edit dialog from the stored row so "Sửa" never starts from a blank form. */
export function damageItemFormFrom(item: DamageItem): DamageItemFormValues {
  return {
    active: item.active,
    code: item.code,
    name: item.name,
    priceVnd: String(item.priceVnd),
  };
}

function parsePriceVnd(value: string): number | undefined {
  const trimmed = value.trim();
  return NON_NEGATIVE_INTEGER.test(trimmed) ? Number.parseInt(trimmed, 10) : undefined;
}

/** The API upper-cases the code too; this just matches damageItemInputSchema ahead of time. */
export function toDamageItemInput(form: DamageItemFormValues): DamageItemInput {
  return {
    code: form.code.trim().toUpperCase(),
    name: form.name.trim(),
    priceVnd: parsePriceVnd(form.priceVnd) ?? 0,
  };
}

/** damageItemUpdateSchema is strict and never takes a code, so only real changes are sent. */
export function toDamageItemUpdate(
  form: DamageItemFormValues,
  item: DamageItem,
): DamageItemUpdateInput {
  const name = form.name.trim();
  const priceVnd = parsePriceVnd(form.priceVnd) ?? item.priceVnd;
  return {
    ...(name !== item.name ? { name } : {}),
    ...(priceVnd !== item.priceVnd ? { priceVnd } : {}),
    ...(form.active !== item.active ? { active: form.active } : {}),
  };
}

/** Mirrors damageItemInputSchema's bounds so the save button never submits a rejected payload. */
export function damageItemBlocked(form: DamageItemFormValues): boolean {
  if (form.code.trim().length < MIN_CODE_LENGTH) return true;
  if (form.name.trim().length < MIN_NAME_LENGTH) return true;
  const price = parsePriceVnd(form.priceVnd);
  return price === undefined || price > MAX_PRICE_VND;
}

export function damageItemTone(item: DamageItem): 'info' | 'success' {
  return item.active ? 'success' : 'info';
}

/** Options for pickers elsewhere (e.g. the return dialog): active items only, sorted by code. */
export function activeDamageItems(items: readonly DamageItem[]): DamageItem[] {
  return [...items].filter((item) => item.active).sort((a, b) => a.code.localeCompare(b.code));
}
