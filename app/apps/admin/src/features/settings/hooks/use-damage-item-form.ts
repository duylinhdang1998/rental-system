import { useState, type FormEvent } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import type { DamageItem, DamageItemInput, DamageItemUpdateInput } from '@rental/contracts';
import {
  INITIAL_DAMAGE_ITEM_FORM,
  damageItemFormFrom,
  toDamageItemInput,
  toDamageItemUpdate,
  type DamageItemFormValues,
} from '@/features/settings/lib/damage-catalog-presentation';

type CreateMutation = UseMutationResult<DamageItem, Error, DamageItemInput>;
type UpdateMutation = UseMutationResult<
  DamageItem,
  Error,
  { id: string; patch: DamageItemUpdateInput }
>;

/** One form for both flows: with no item it creates, with one it patches only what changed. */
export function useDamageItemForm(
  item: DamageItem | undefined,
  createMutation: CreateMutation,
  updateMutation: UpdateMutation,
  onDone: () => void,
) {
  const [form, setForm] = useState<DamageItemFormValues>(() =>
    item ? damageItemFormFrom(item) : INITIAL_DAMAGE_ITEM_FORM,
  );
  const change = <TField extends keyof DamageItemFormValues>(
    field: TField,
    value: DamageItemFormValues[TField],
  ) => setForm((current) => ({ ...current, [field]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (item) {
      updateMutation.mutate(
        { id: item.id, patch: toDamageItemUpdate(form, item) },
        { onSuccess: onDone },
      );
    } else {
      createMutation.mutate(toDamageItemInput(form), { onSuccess: onDone });
    }
  };
  return { change, form, mutation: item ? updateMutation : createMutation, submit };
}

export type DamageItemForm = ReturnType<typeof useDamageItemForm>;
