import { useTranslation } from 'react-i18next';
import { SelectItem } from '@/components/ui/select-item';
import { PRIMARY_COLORS } from '@/shared/theme/primary-color';

export function PrimaryColorOptions() {
  const { t } = useTranslation();
  return PRIMARY_COLORS.map((color) => (
    <SelectItem
      className="min-h-11 focus:bg-brand-soft focus:text-brand-ink"
      key={color.id}
      value={color.id}
    >
      <span className="flex items-center gap-3">
        <span aria-hidden className={`size-4 shrink-0 rounded-full ${color.swatch}`} />
        {t(`primaryColors.${color.id}`)}
      </span>
    </SelectItem>
  ));
}
