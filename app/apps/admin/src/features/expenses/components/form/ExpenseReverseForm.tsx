import { useTranslation } from 'react-i18next';
import { MutationAlert } from '@/features/contracts/components/lifecycle/MutationAlert';
import { useExpenseReversalForm } from '@/features/expenses/hooks/use-expense-form';
import { useReverseExpense } from '@/features/expenses/hooks/use-expenses';
import { FormActions } from '@/shared/ui/FormActions';
import { TextField } from '@/shared/ui/TextField';

interface ExpenseReverseFormProps {
  expenseId: string;
  onClose: () => void;
}

const MIN_REASON = 3;
const MAX_REASON = 240;

export function ExpenseReverseForm({ expenseId, onClose }: ExpenseReverseFormProps) {
  const { t } = useTranslation();
  const mutation = useReverseExpense(expenseId);
  const form = useExpenseReversalForm(mutation, onClose);
  return (
    <form className="grid gap-4" onSubmit={form.submit}>
      <MutationAlert error={mutation.error} />
      <TextField
        data-dialog-autofocus=""
        id="expense-reverse-reason"
        label={t('expenseReverseReason')}
        maxLength={MAX_REASON}
        onChange={(event) => form.setReason(event.target.value)}
        required
        value={form.reason}
      />
      <FormActions
        cancelLabel={t('cancel')}
        disabled={form.reason.trim().length < MIN_REASON}
        loading={mutation.isPending}
        onCancel={onClose}
        saveLabel={t('expenseReverseConfirm')}
        saveVariant="destructive"
      />
    </form>
  );
}
