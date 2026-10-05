import { CustomerEmptyState } from '@/features/customers/components/list/CustomerEmptyState';
import { QueryRegion } from '@/shared/ui/QueryRegion';
import { CustomerCreateDialog } from '@/features/customers/components/form/CustomerCreateDialog';
import { CustomerList } from '@/features/customers/components/list/CustomerList';
import { CustomerPageHeader } from '@/features/customers/components/list/CustomerPageHeader';
import { CustomerSearch } from '@/features/customers/components/list/CustomerSearch';
import { useCustomerPage } from '@/features/customers/hooks/use-customer-page';

export function CustomerListPage() {
  const page = useCustomerPage();
  return (
    <section className="grid gap-5">
      <CustomerPageHeader onAdd={() => page.setFormOpen(true)} />
      <CustomerCreateDialog onOpenChange={page.setFormOpen} open={page.formOpen} />
      <CustomerSearch onChange={page.updateSearch} value={page.search} />
      <QueryRegion query={page.customers}>
        {(data) =>
          data.items.length ? (
            <CustomerList customers={data.items} />
          ) : (
            <CustomerEmptyState page={page} />
          )
        }
      </QueryRegion>
    </section>
  );
}
