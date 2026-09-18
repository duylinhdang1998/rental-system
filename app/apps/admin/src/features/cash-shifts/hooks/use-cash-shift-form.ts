import { useState, type FormEvent } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import type { CashShift } from '@rental/contracts';

/** Generic open/close shift form state, mirroring the contracts feature's lifecycle form hook. */
export function useCashShiftForm<TForm extends object, TInput>(
  initial: TForm,
  toInput: (form: TForm) => TInput,
  mutation: UseMutationResult<CashShift, Error, TInput>,
  onDone: () => void,
) {
  const [form, setForm] = useState(initial);
  const change = <TField extends keyof TForm>(field: TField, value: TForm[TField]) =>
    setForm((current) => ({ ...current, [field]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    mutation.mutate(toInput(form), { onSuccess: onDone });
  };
  return { change, form, submit };
}
