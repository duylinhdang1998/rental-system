import { useTranslation } from 'react-i18next';
import { TextAreaField } from '@/shared/ui/TextAreaField';

interface CloseShiftNoteFieldProps {
  onChange: (value: string) => void;
  value: string;
}

export function CloseShiftNoteField({ onChange, value }: CloseShiftNoteFieldProps) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-1">
      <TextAreaField
        id="cash-shift-note"
        label={t('cashShiftNote')}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
      <p className="text-xs text-ink-muted">{t('cashShiftNoteRequired')}</p>
    </div>
  );
}
