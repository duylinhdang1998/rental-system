import { useState, type FormEvent } from 'react';
import type { VehicleInput } from '@rental/contracts';
import { useCreateVehicle } from './use-fleet';

const DEFAULT_YEAR = 2026;
const EMPTY_FORM: VehicleInput = {
  code: '',
  color: '',
  model: '',
  plate: '',
  typeCode: 'SCOOTER',
  year: DEFAULT_YEAR,
};

export function useVehicleForm(onCreated: () => void) {
  const [input, setInput] = useState(EMPTY_FORM);
  const create = useCreateVehicle();
  const change = (field: keyof VehicleInput, value: string) => {
    setInput((current) => ({ ...current, [field]: field === 'year' ? Number(value) : value }));
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    create.mutate(input, {
      onSuccess: () => {
        setInput(EMPTY_FORM);
        onCreated();
      },
    });
  };
  return { change, create, input, submit };
}
