import { useTranslation } from 'react-i18next';
import { NotesField } from '@/features/contracts/components/lifecycle/NotesField';
import type { SettleFormValues } from '@/features/contracts/lib/settlement-presentation';
import { CheckboxField } from '@/shared/ui/CheckboxField';

interface SettleChecklistFieldsProps {
  onChange: <TField extends keyof SettleFormValues>(
    field: TField,
    value: SettleFormValues[TField],
  ) => void;
  retainedDocument: string;
  values: SettleFormValues;
}

/** The physical hand-back is confirmed explicitly; the deposit refund is a separate action (PD-17). */
export function SettleChecklistFields(props: SettleChecklistFieldsProps) {
  const { onChange, retainedDocument, values } = props;
  const { t } = useTranslation();
  return (
    <div className="grid gap-3">
      {retainedDocument ? (
        <CheckboxField
          checked={values.documentReturned}
          id="settle-document-returned"
          label={t('settleDocumentReturned', { document: retainedDocument })}
          onChange={(checked) => onChange('documentReturned', checked)}
        />
      ) : null}
      <NotesField
        id="settle-notes"
        labelKey="settleNotes"
        onChange={(value) => onChange('notes', value)}
        value={values.notes}
      />
    </div>
  );
}
