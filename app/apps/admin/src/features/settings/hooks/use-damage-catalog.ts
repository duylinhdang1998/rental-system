import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import type {
  DamageItem,
  DamageItemInput,
  DamageItemList,
  DamageItemUpdateInput,
} from '@rental/contracts';
import {
  createDamageItem,
  fetchDamageItems,
  updateDamageItem,
} from '@/features/settings/api/damage-catalog-api';

const BASE_QUERY_KEY = ['damage-items'];

/** Reused by the contracts feature for the "Hạng mục hư hỏng" picker; keep this signature. */
export function useDamageCatalog(includeInactive: boolean): UseQueryResult<DamageItemList, Error> {
  return useQuery({
    queryFn: () => fetchDamageItems(includeInactive),
    queryKey: [...BASE_QUERY_KEY, includeInactive],
  });
}

function useInvalidateDamageCatalog() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: BASE_QUERY_KEY });
}

export function useCreateDamageItem() {
  const invalidate = useInvalidateDamageCatalog();
  return useMutation({
    mutationFn: (input: DamageItemInput) => createDamageItem(input),
    onSuccess: invalidate,
  });
}

export function useUpdateDamageItem() {
  const invalidate = useInvalidateDamageCatalog();
  return useMutation<DamageItem, Error, { id: string; patch: DamageItemUpdateInput }>({
    mutationFn: (input) => updateDamageItem(input.id, input.patch),
    onSuccess: invalidate,
  });
}
