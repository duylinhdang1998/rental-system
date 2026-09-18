import { useTranslation } from 'react-i18next';
import type { DamageItem } from '@rental/contracts';
import { TableBody } from '@/components/ui/table-body';
import { TableHead } from '@/components/ui/table-head';
import { TableHeader } from '@/components/ui/table-header';
import { Table } from '@/components/ui/table-root';
import { TableRow } from '@/components/ui/table-row';
import { DamageItemRow } from '@/features/settings/components/damage/DamageItemRow';

interface DamageItemTableProps {
  busy: boolean;
  items: DamageItem[];
  onEdit: (item: DamageItem) => void;
  onToggle: (item: DamageItem) => void;
}

const COLUMN_KEYS = ['code', 'name', 'price', 'status'] as const;

export function DamageItemTable({ busy, items, onEdit, onToggle }: DamageItemTableProps) {
  const { t } = useTranslation();
  return (
    <div className="surface-card hidden overflow-x-auto md:block">
      <Table>
        <TableHeader className="bg-panel-subtle text-sm text-ink-muted">
          <TableRow>
            {COLUMN_KEYS.map((key) => (
              <TableHead key={key}>{t(`damageItemColumns.${key}`)}</TableHead>
            ))}
            <TableHead>
              <span className="sr-only">{t('damageItemColumns.actions')}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <DamageItemRow
              busy={busy}
              item={item}
              key={item.id}
              onEdit={() => onEdit(item)}
              onToggle={() => onToggle(item)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
