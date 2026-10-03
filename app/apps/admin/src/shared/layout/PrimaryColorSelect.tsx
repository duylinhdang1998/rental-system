import { useTranslation } from 'react-i18next';
import { Select } from '@/components/ui/select-root';
import { SelectTrigger } from '@/components/ui/select-trigger';
import { SelectContent } from '@/components/ui/select-content';
import { usePrimaryColor } from '@/shared/hooks/use-primary-color';
import { PrimaryColorOptions } from '@/shared/layout/PrimaryColorOptions';

export function PrimaryColorSelect() {
  const { t } = useTranslation();
  const { color, selectColor } = usePrimaryColor();
  return (
    <Select onValueChange={selectColor} value={color.id}>
      <SelectTrigger aria-label={`${t('primaryColor')}: ${t(`primaryColors.${color.id}`)}`}>
        <span aria-hidden className="size-4 shrink-0 rounded-full bg-brand" />
        <span className="hidden sm:inline">{t(`primaryColors.${color.id}`)}</span>
      </SelectTrigger>
      <SelectContent align="end" position="popper">
        <PrimaryColorOptions />
      </SelectContent>
    </Select>
  );
}
