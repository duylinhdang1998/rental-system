import { useTranslation } from 'react-i18next';
import type { DamageItem } from '@rental/contracts';
import { TableCell } from '@/components/ui/table-cell';
import { TableRow } from '@/components/ui/table-row';
import { DamageItemActions } from '@/features/settings/components/damage/DamageItemActions';
import { damageItemTone } from '@/features/settings/lib/damage-catalog-presentation';
import { formatCurrency, resolveInitialLocale } from '@/shared/i18n/locale';
import { StatusBadge } from '@/shared/ui/StatusBadge';

interface DamageItemRowProps {
  busy: boolean;
  item: DamageItem;
  onEdit: () => void;
  onToggle: () => void;
}

export function DamageItemRow({ busy, item, onEdit, onToggle }: DamageItemRowProps) {
  const { i18n, t } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  return (
    <TableRow data-damage-item-row={item.code}>
      <TableCell className="font-extrabold text-ink">{item.code}</TableCell>
      <TableCell>{item.name}</TableCell>
      <TableCell className="whitespace-nowrap font-bold text-ink">
        {formatCurrency(item.priceVnd, locale)}
      </TableCell>
      <TableCell>
        <StatusBadge
          label={t(item.active ? 'damageItemStatusActive' : 'damageItemStatusInactive')}
          tone={damageItemTone(item)}
        />
      </TableCell>
      <TableCell>
        <DamageItemActions busy={busy} item={item} onEdit={onEdit} onToggle={onToggle} />
      </TableCell>
    </TableRow>
  );
}
