import type { CustomerSummary } from '@rental/contracts';
import { BlacklistWarning } from './BlacklistWarning';
import { CustomerCard } from './CustomerCard';
import { CustomerTable } from './CustomerTable';

interface CustomerListProps {
  customers: CustomerSummary[];
}

export function CustomerList({ customers }: CustomerListProps) {
  return (
    <div className="grid gap-4">
      {customers.map((customer) =>
        customer.warning ? (
          <BlacklistWarning
            acknowledgementId={`customer-warning-${customer.id}`}
            key={customer.id}
            reason={customer.warning.reason}
          />
        ) : null,
      )}
      <div className="grid gap-4 sm:hidden">
        {customers.map((customer) => (
          <CustomerCard customer={customer} key={customer.id} />
        ))}
      </div>
      <CustomerTable customers={customers} />
    </div>
  );
}
