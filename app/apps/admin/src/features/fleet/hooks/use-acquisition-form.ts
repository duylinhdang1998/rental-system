import { useState, type FormEvent } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import type { VehicleAcquisition, VehicleAcquisitionInput } from '@rental/contracts';
import {
  acquisitionFormFrom,
  toAcquisitionInput,
  type AcquisitionFormValues,
} from '@/features/fleet/lib/acquisition-presentation';

export function useAcquisitionForm(
  acquisition: VehicleAcquisition | null,
  mutation: UseMutationResult<VehicleAcquisition, Error, VehicleAcquisitionInput>,
  onDone: () => void,
) {
  const [form, setForm] = useState(() => acquisitionFormFrom(acquisition));
  const change = <TField extends keyof AcquisitionFormValues>(
    field: TField,
    value: AcquisitionFormValues[TField],
  ) => setForm((current) => ({ ...current, [field]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    mutation.mutate(toAcquisitionInput(form), { onSuccess: onDone });
  };
  return { change, form, submit };
}
