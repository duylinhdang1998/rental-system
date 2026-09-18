import { useState } from 'react';
import type { DamageItem } from '@rental/contracts';
import {
  useDamageCatalog,
  useUpdateDamageItem,
} from '@/features/settings/hooks/use-damage-catalog';

export type DamageItemDialogState = { kind: 'create' } | { item: DamageItem; kind: 'edit' };

/** Owns the show-inactive toggle and the create/edit dialog for the damage catalog page. */
export function useDamageCatalogPage() {
  const [showInactive, setShowInactive] = useState(false);
  const [dialog, setDialog] = useState<DamageItemDialogState | null>(null);
  const items = useDamageCatalog(showInactive);
  const toggle = useUpdateDamageItem();
  return {
    close: () => setDialog(null),
    dialog,
    items,
    openCreate: () => setDialog({ kind: 'create' }),
    openEdit: (item: DamageItem) => setDialog({ item, kind: 'edit' }),
    setShowInactive,
    showInactive,
    toggle,
    toggleActive: (item: DamageItem) =>
      toggle.mutate({ id: item.id, patch: { active: !item.active } }),
  };
}

export type DamageCatalogPage = ReturnType<typeof useDamageCatalogPage>;
