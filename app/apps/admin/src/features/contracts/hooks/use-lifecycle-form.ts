import { useState, type FormEvent } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import type { RentalContract } from '@rental/contracts';

export function useLifecycleForm<TForm extends object, TInput>(
  initial: TForm,
  toInput: (form: TForm) => TInput,
  mutation: UseMutationResult<RentalContract, Error, TInput>,
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
