import { useTranslation } from 'react-i18next';
import type { DamageItemForm } from '@/features/settings/hooks/use-damage-item-form';
import { DamageItemCodeField } from '@/features/settings/components/damage/DamageItemCodeField';
import { TextField } from '@/shared/ui/TextField';

interface DamageItemFieldsProps {
  form: DamageItemForm;
  isEdit: boolean;
}

const MAX_NAME_LENGTH = 120;
const MAX_PRICE_VND = 1_000_000_000;

export function DamageItemFields({ form, isEdit }: DamageItemFieldsProps) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4">
      <DamageItemCodeField form={form} isEdit={isEdit} />
      <TextField
        data-dialog-autofocus=""
        id="damage-item-name"
        label={t('damageItemFieldName')}
        maxLength={MAX_NAME_LENGTH}
        onChange={(event) => form.change('name', event.target.value)}
        required
        value={form.form.name}
      />
      <TextField
        id="damage-item-price"
        inputMode="numeric"
        label={t('damageItemFieldPrice')}
        max={MAX_PRICE_VND}
        min={0}
        onChange={(event) => form.change('priceVnd', event.target.value)}
        required
        type="number"
        value={form.form.priceVnd}
      />
    </div>
  );
}
