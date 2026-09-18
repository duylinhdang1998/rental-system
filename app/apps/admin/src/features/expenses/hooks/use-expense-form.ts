import { useState, type FormEvent } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import type { Expense, ExpenseInput, ExpenseReversalInput } from '@rental/contracts';
import {
  initialExpenseForm,
  toExpenseInput,
  type ExpenseFormValues,
} from '@/features/expenses/lib/expense-presentation';

/** One idempotency key per open dialog: a retried submit replays instead of double-booking. */
export function useExpenseForm(
  mutation: UseMutationResult<Expense, Error, ExpenseInput>,
  onDone: () => void,
) {
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [form, setForm] = useState(() => initialExpenseForm(new Date()));
  const change = <TField extends keyof ExpenseFormValues>(
    field: TField,
    value: ExpenseFormValues[TField],
  ) => setForm((current) => ({ ...current, [field]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    mutation.mutate(toExpenseInput(form, idempotencyKey), { onSuccess: onDone });
  };
  return { change, form, submit };
}

export function useExpenseReversalForm(
  mutation: UseMutationResult<Expense, Error, ExpenseReversalInput>,
  onDone: () => void,
) {
  const [reason, setReason] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    mutation.mutate({ reason: reason.trim() }, { onSuccess: onDone });
  };
  return { reason, setReason, submit };
}
