import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ViewState } from '../../shared/ui/ViewState';
import { CustomerForm } from './CustomerForm';
import { CustomerList } from './CustomerList';
import { CustomerPageHeader } from './CustomerPageHeader';
import { CustomerSearch } from './CustomerSearch';
import { useCustomers } from './use-customers';

export function CustomerListPage() {
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
  if (customers.isPending) return <ViewState state="loading" />;
  if (customers.isError)
    return <ViewState onRetry={() => void customers.refetch()} state="error" />;
  return (
    <section className="grid gap-5">
      <CustomerPageHeader onAdd={() => setFormOpen(true)} />
      {formOpen ? <CustomerForm onClose={() => setFormOpen(false)} /> : null}
      <CustomerSearch onChange={updateSearch} value={search} />
      {customers.data.items.length ? (
        <CustomerList customers={customers.data.items} />
      ) : (
        <ViewState state="empty" />
      )}
    </section>
  );
}
