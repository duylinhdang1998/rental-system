import { useTranslation } from 'react-i18next';
import { formatDateTime, resolveInitialLocale } from '@/shared/i18n/locale';
import { TextAreaField } from '@/shared/ui/TextAreaField';
import { TextField } from '@/shared/ui/TextField';

export interface ExtendFormValues {
  newEndLocal: string;
  reason: string;
}

interface ExtendFieldsProps {
  currentEndAt: string;
  onChange: (field: keyof ExtendFormValues, value: string) => void;
  values: ExtendFormValues;
}

const MAX_REASON = 240;

export function ExtendContractFields({ currentEndAt, onChange, values }: ExtendFieldsProps) {
  const { i18n, t } = useTranslation();
  return (
    <div className="grid gap-4">
      <p className="text-sm text-ink-muted">
        {t('contractCurrentEnd')}:{' '}
        <strong className="text-ink">
          {formatDateTime(currentEndAt, resolveInitialLocale(i18n.language))}
        </strong>
      </p>
      <TextField
        data-dialog-autofocus=""
        id="contract-new-end"
        label={t('contractNewEnd')}
        onChange={(event) => onChange('newEndLocal', event.target.value)}
        required
        type="datetime-local"
        value={values.newEndLocal}
      />
      <TextAreaField
        id="contract-extend-reason"
        label={t('contractExtendReason')}
        maxLength={MAX_REASON}
        onChange={(event) => onChange('reason', event.target.value)}
        value={values.reason}
      />
    </div>
  );
}
