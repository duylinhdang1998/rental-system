import type { DamageItem } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { useActiveDamageItems } from '@/features/contracts/hooks/use-damage-items';
import { formatCurrency, resolveInitialLocale } from '@/shared/i18n/locale';
import { SelectField } from '@/shared/ui/SelectField';

interface DamageItemSelectProps {
  id: string;
  onSelect: (item: DamageItem | null) => void;
  value: string;
}

/** US-026: the first option keeps free text; a catalog item is priced by the API at write time. */
export function DamageItemSelect({ id, onSelect, value }: DamageItemSelectProps) {
  const { i18n, t } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  const items = useActiveDamageItems().data?.items ?? [];
  return (
    <SelectField
      id={id}
      label={t('damageItem')}
      onChange={(next) => onSelect(items.find((item) => item.id === next) ?? null)}
      options={[
        { label: t('damageItemFreeText'), value: '' },
        ...items.map((item) => ({
          label: `${item.name} · ${formatCurrency(item.priceVnd, locale)}`,
          value: item.id,
        })),
      ]}
      value={value}
    />
  );
}
