import type { CustomerSummary } from '@rental/contracts';
import { useSelection } from '@/shared/hooks/use-selection';
import { CustomerWarnings } from '@/features/customers/components/list/CustomerWarnings';
import { CustomerDetailDialog } from '@/features/customers/components/list/CustomerDetailDialog';
import { CustomerCard } from '@/features/customers/components/list/CustomerCard';
import { CustomerTable } from '@/features/customers/components/list/CustomerTable';

interface CustomerListProps {
  customers: CustomerSummary[];
}

export function CustomerList({ customers }: CustomerListProps) {
  const { selected, select: setSelected } = useSelection<CustomerSummary>();
  return (
    <div className="grid gap-4">
      <CustomerWarnings customers={customers} />
      <div className="grid gap-4 sm:hidden">
        {customers.map((customer) => (
          <CustomerCard
            customer={customer}
            key={customer.id}
            onDetails={() => setSelected(customer)}
          />
        ))}
      </div>
      <CustomerTable customers={customers} onDetails={setSelected} />
      {selected ? (
        <CustomerDetailDialog customer={selected} onClose={() => setSelected(null)} />
      ) : null}
    </div>
  );
}
