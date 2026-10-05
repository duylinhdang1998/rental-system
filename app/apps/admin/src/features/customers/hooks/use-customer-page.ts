import { useState } from 'react';
import { useStableSearchParams } from '@/shared/hooks/use-stable-search-params';
import { useCustomers } from '@/features/customers/hooks/use-customers';

export function useCustomerPage() {
  const [params, setParams] = useStableSearchParams();
  const [formOpen, setFormOpen] = useState(false);
  const search = params.get('search') ?? '';
  const customers = useCustomers(search || undefined);
  const updateSearch = (value: string) =>
    setParams((current) => {
      if (value) current.set('search', value);
      else current.delete('search');
      return current;
    });
  return { customers, formOpen, search, setFormOpen, updateSearch };
}
