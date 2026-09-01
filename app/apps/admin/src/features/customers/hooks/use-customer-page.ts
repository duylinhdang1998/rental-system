import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCustomers } from '@/features/customers/hooks/use-customers';

export function useCustomerPage() {
  const [params, setParams] = useSearchParams();
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
