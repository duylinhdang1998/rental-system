import { useQuery } from '@tanstack/react-query';
import type { ContractListQuery } from '@rental/contracts';
import { fetchContract, fetchContracts } from '@/features/contracts/api/contracts-api';

export function useContracts(query: ContractListQuery) {
  return useQuery({ queryFn: () => fetchContracts(query), queryKey: ['contracts', query] });
}

export function useContract(id: string) {
  return useQuery({ queryFn: () => fetchContract(id), queryKey: ['contracts', id] });
}
