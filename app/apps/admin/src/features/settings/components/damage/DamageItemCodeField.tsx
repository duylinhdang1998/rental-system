import { useTranslation } from 'react-i18next';
import type { DamageItemForm } from '@/features/settings/hooks/use-damage-item-form';
import { TextField } from '@/shared/ui/TextField';

interface DamageItemCodeFieldProps {
  form: DamageItemForm;
  isEdit: boolean;
}

const MAX_CODE_LENGTH = 24;

export function DamageItemCodeField({ form, isEdit }: DamageItemCodeFieldProps) {
  const { t } = useTranslation();
  return (
    <div>
      <TextField
        disabled={isEdit}
        id="damage-item-code"
        label={t('damageItemFieldCode')}
        maxLength={MAX_CODE_LENGTH}
        onChange={(event) => form.change('code', event.target.value.toUpperCase())}
        required
        value={form.form.code}
      />
      <p className="mt-1 text-xs text-ink-muted">{t('damageItemCodeHelp')}</p>
    </div>
  );
}
