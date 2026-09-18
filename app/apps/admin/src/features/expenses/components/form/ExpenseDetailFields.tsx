import { useTranslation } from 'react-i18next';
import { NotesField } from '@/features/contracts/components/lifecycle/NotesField';
import type {
  ExpenseFieldChange,
  ExpenseFormValues,
} from '@/features/expenses/lib/expense-presentation';
import { TextField } from '@/shared/ui/TextField';

interface ExpenseDetailFieldsProps {
  onChange: ExpenseFieldChange;
  values: ExpenseFormValues;
}

const MAX_DESCRIPTION = 240;
const MAX_REFERENCE = 120;

export function ExpenseDetailFields({ onChange, values }: ExpenseDetailFieldsProps) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4">
      <TextField
        id="expense-description"
        label={t('expenseDescription')}
        maxLength={MAX_DESCRIPTION}
        onChange={(event) => onChange('description', event.target.value)}
        required
        value={values.description}
      />
      <TextField
        id="expense-reference"
        label={t('expenseReference')}
        maxLength={MAX_REFERENCE}
        onChange={(event) => onChange('reference', event.target.value)}
        value={values.reference}
      />
      <NotesField
        id="expense-notes"
        labelKey="expenseNotes"
        onChange={(value) => onChange('notes', value)}
        value={values.notes}
      />
    </div>
  );
}
