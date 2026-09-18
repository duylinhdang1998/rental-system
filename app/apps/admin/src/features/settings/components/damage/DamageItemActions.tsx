import { CircleSlash, Pencil, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { DamageItem } from '@rental/contracts';
import { DamageItemActionButton } from '@/features/settings/components/damage/DamageItemActionButton';

interface DamageItemActionsProps {
  busy: boolean;
  item: DamageItem;
  onEdit: () => void;
  onToggle: () => void;
}

export function DamageItemActions({ busy, item, onEdit, onToggle }: DamageItemActionsProps) {
  const { t } = useTranslation();
  const toggleLabel = t(item.active ? 'damageItemDeactivate' : 'damageItemActivate');
  return (
    <div className="flex flex-wrap gap-2">
      <DamageItemActionButton
        code={item.code}
        disabled={busy}
        icon={Pencil}
        label={t('damageItemEdit')}
        onClick={onEdit}
        variant="outline"
      />
      <DamageItemActionButton
        code={item.code}
        disabled={busy}
        icon={item.active ? CircleSlash : RotateCcw}
        label={toggleLabel}
        onClick={onToggle}
        variant={item.active ? 'destructive' : 'default'}
      />
    </div>
  );
}
