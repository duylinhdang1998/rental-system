import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CustomerInput } from '@rental/contracts';
import { createCustomer, fetchCustomers } from '../api/customers-api';

export function useCustomers(search?: string) {
  return useQuery({ queryFn: () => fetchCustomers(search), queryKey: ['customers', search] });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CustomerInput) => createCustomer(input),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });
}
