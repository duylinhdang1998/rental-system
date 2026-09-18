import { useTranslation } from 'react-i18next';
import type { DamageItem } from '@rental/contracts';
import { DamageItemActions } from '@/features/settings/components/damage/DamageItemActions';
import { damageItemTone } from '@/features/settings/lib/damage-catalog-presentation';
import { formatCurrency, resolveInitialLocale } from '@/shared/i18n/locale';
import { StatusBadge } from '@/shared/ui/StatusBadge';

interface DamageItemCardProps {
  busy: boolean;
  item: DamageItem;
  onEdit: () => void;
  onToggle: () => void;
}

export function DamageItemCard({ busy, item, onEdit, onToggle }: DamageItemCardProps) {
  const { i18n, t } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  return (
    <li className="surface-card grid gap-3 p-4" data-damage-item-row={item.code} data-mobile-card>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-ink-muted">{item.code}</p>
          <h2 className="text-lg font-extrabold text-ink">{item.name}</h2>
        </div>
        <StatusBadge
          label={t(item.active ? 'damageItemStatusActive' : 'damageItemStatusInactive')}
          tone={damageItemTone(item)}
        />
      </div>
      <p className="text-xl font-black text-ink">{formatCurrency(item.priceVnd, locale)}</p>
      <DamageItemActions busy={busy} item={item} onEdit={onEdit} onToggle={onToggle} />
    </li>
  );
}
