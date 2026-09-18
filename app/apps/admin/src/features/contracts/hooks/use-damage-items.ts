import { useDamageCatalog } from '@/features/settings/hooks/use-damage-catalog';

/** Active catalog items for the return and charge dialogs; both roles may read them. */
export function useActiveDamageItems() {
  return useDamageCatalog(false);
}
