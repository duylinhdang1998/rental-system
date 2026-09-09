import { useSearchParams } from 'react-router-dom';
import { contractStatusSchema, type ContractListQuery } from '@rental/contracts';
import { useContracts } from '@/features/contracts/hooks/use-contracts';

function parsedStatus(value: string | null): ContractListQuery['status'] {
  const parsed = contractStatusSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

export function useContractListPage() {
  const [params, setParams] = useSearchParams();
  const filters: ContractListQuery = {
    search: params.get('search') ?? undefined,
    status: parsedStatus(params.get('status')),
  };
  const contracts = useContracts(filters);
  const update = (key: 'search' | 'status', value: string) =>
    setParams((current) => {
      if (value) current.set(key, value);
      else current.delete(key);
      return current;
    });
  return { contracts, filters, update };
}
