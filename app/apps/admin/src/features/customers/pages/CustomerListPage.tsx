import { ViewState } from '../../../shared/ui/ViewState';
import { CustomerCreateDialog } from '../components/form/CustomerCreateDialog';
import { CustomerList } from '../components/list/CustomerList';
import { CustomerPageHeader } from '../components/list/CustomerPageHeader';
import { CustomerSearch } from '../components/list/CustomerSearch';
import { useCustomerPage } from '../hooks/use-customer-page';

export function CustomerListPage() {
  const page = useCustomerPage();
  if (page.customers.isPending) return <ViewState state="loading" />;
  if (page.customers.isError)
    return <ViewState onRetry={() => void page.customers.refetch()} state="error" />;
  return (
    <section className="grid gap-5">
      <CustomerPageHeader onAdd={() => page.setFormOpen(true)} />
      <CustomerCreateDialog onOpenChange={page.setFormOpen} open={page.formOpen} />
      <CustomerSearch onChange={page.updateSearch} value={page.search} />
      {page.customers.data.items.length ? (
        <CustomerList customers={page.customers.data.items} />
      ) : (
        <ViewState state="empty" />
      )}
    </section>
  );
}
