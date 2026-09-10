import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { RentalContract } from '@rental/contracts';

const INVALIDATED_KEYS = [
  ['contracts'],
  ['fleet'],
  ['ledger'],
  ['operations-board'],
  ['receivables'],
  ['return-queue'],
  ['revenue-report'],
  ['settlement'],
];

export function useContractMutation<TInput>(
  id: string,
  action: (contractId: string, input: TInput) => Promise<RentalContract>,
) {
  const queryClient = useQueryClient();
  return useMutation<RentalContract, Error, TInput>({
    mutationFn: (input) => action(id, input),
    onSuccess: async () => {
      await Promise.all(
        INVALIDATED_KEYS.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      );
    },
  });
}
