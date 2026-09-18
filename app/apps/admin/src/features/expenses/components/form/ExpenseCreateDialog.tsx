import type { Vehicle } from '@rental/contracts';
import { LifecycleFormDialog } from '@/features/contracts/components/lifecycle/LifecycleFormDialog';
import { ExpenseAmountFields } from '@/features/expenses/components/form/ExpenseAmountFields';
import { ExpenseDetailFields } from '@/features/expenses/components/form/ExpenseDetailFields';
import { ExpenseMethodFields } from '@/features/expenses/components/form/ExpenseMethodFields';
import { ExpenseVehicleField } from '@/features/expenses/components/form/ExpenseVehicleField';
import { useExpenseForm } from '@/features/expenses/hooks/use-expense-form';
import { useRecordExpense } from '@/features/expenses/hooks/use-expenses';
import { expenseBlocked } from '@/features/expenses/lib/expense-presentation';

interface ExpenseCreateDialogProps {
  onClose: () => void;
  vehicles: Vehicle[];
}

const COPY_KEYS = {
  description: 'expenseDialogBody',
  save: 'expenseConfirm',
  title: 'expenseDialogTitle',
};

export function ExpenseCreateDialog({ onClose, vehicles }: ExpenseCreateDialogProps) {
  const mutation = useRecordExpense();
  const form = useExpenseForm(mutation, onClose);
  return (
    <LifecycleFormDialog
      copyKeys={COPY_KEYS}
      mutation={mutation}
      onClose={onClose}
      onSubmit={form.submit}
      submitDisabled={expenseBlocked(form.form)}
    >
      <ExpenseMethodFields onChange={form.change} values={form.form} />
      <ExpenseAmountFields onChange={form.change} values={form.form} />
      <ExpenseVehicleField
        onChange={(vehicleId) => form.change('vehicleId', vehicleId)}
        value={form.form.vehicleId}
        vehicles={vehicles}
      />
      <ExpenseDetailFields onChange={form.change} values={form.form} />
    </LifecycleFormDialog>
  );
}
