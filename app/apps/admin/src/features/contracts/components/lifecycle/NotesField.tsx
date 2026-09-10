import { useTranslation } from 'react-i18next';
import { TextAreaField } from '@/shared/ui/TextAreaField';

const MAX_NOTES = 1000;

interface NotesFieldProps {
  id: string;
  labelKey: string;
  onChange: (value: string) => void;
  value: string;
}

/** Free-text notes shared by the return and settlement dialogs. */
export function NotesField({ id, labelKey, onChange, value }: NotesFieldProps) {
  const { t } = useTranslation();
  return (
    <TextAreaField
      id={id}
      label={t(labelKey)}
      maxLength={MAX_NOTES}
      onChange={(event) => onChange(event.target.value)}
      value={value}
    />
  );
}
