import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PublishPricingInput } from '@rental/contracts';
import { fetchCurrentPricing, publishPricing } from './settings-api';

const QUERY_KEY = ['pricing', 'SCOOTER'];

export function useCurrentPricing() {
  return useQuery({ queryFn: fetchCurrentPricing, queryKey: QUERY_KEY });
}

export function usePublishPricing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PublishPricingInput) => publishPricing(input),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
