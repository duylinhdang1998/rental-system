import type { CustomerSummary } from '@rental/contracts';
import { CustomerCard } from './CustomerCard';

interface CustomerListProps {
  customers: CustomerSummary[];
}

export function CustomerList({ customers }: CustomerListProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {customers.map((customer) => (
        <CustomerCard customer={customer} key={customer.id} />
      ))}
    </div>
  );
}
