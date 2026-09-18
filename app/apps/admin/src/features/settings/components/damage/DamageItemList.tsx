import { useTranslation } from 'react-i18next';
import type { DamageItem } from '@rental/contracts';
import { DamageItemCard } from '@/features/settings/components/damage/DamageItemCard';
import { DamageItemTable } from '@/features/settings/components/damage/DamageItemTable';

interface DamageItemListProps {
  busy: boolean;
  items: DamageItem[];
  onEdit: (item: DamageItem) => void;
  onToggle: (item: DamageItem) => void;
}

/** Table on md+ screens, cards on phones — the same catalog rows either way. */
export function DamageItemList({ busy, items, onEdit, onToggle }: DamageItemListProps) {
  const { t } = useTranslation();
  if (items.length === 0) {
    return (
      <p className="surface-card p-6 text-center text-ink-muted" data-damage-items-empty>
        {t('damageItemEmpty')}
      </p>
    );
  }
  return (
    <>
      <DamageItemTable busy={busy} items={items} onEdit={onEdit} onToggle={onToggle} />
      <ul className="grid gap-3 md:hidden">
        {items.map((item) => (
          <DamageItemCard
            busy={busy}
            item={item}
            key={item.id}
            onEdit={() => onEdit(item)}
            onToggle={() => onToggle(item)}
          />
        ))}
      </ul>
    </>
  );
}
