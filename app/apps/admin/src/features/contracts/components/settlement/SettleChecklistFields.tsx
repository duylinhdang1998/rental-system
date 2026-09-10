import type { SettlementFigures } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { NotesField } from '@/features/contracts/components/lifecycle/NotesField';
import type { SettleFormValues } from '@/features/contracts/lib/settlement-presentation';
import { CheckboxField } from '@/shared/ui/CheckboxField';

interface SettleChecklistFieldsProps {
  onChange: <TField extends keyof SettleFormValues>(
    field: TField,
    value: SettleFormValues[TField],
  ) => void;
  preview: SettlementFigures;
  retainedDocument: string;
  values: SettleFormValues;
}

/** Physical hand-backs are confirmed explicitly; the API refuses the settlement otherwise. */
export function SettleChecklistFields(props: SettleChecklistFieldsProps) {
  const { onChange, preview, retainedDocument, values } = props;
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
      {preview.refundVnd > 0 ? (
        <CheckboxField
          checked={values.depositRefunded}
          id="settle-deposit-refunded"
          label={t('settleDepositRefunded')}
          onChange={(checked) => onChange('depositRefunded', checked)}
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
