import type { CustomerSummary } from '@rental/contracts';
import { BlacklistWarning } from '@/features/customers/components/list/BlacklistWarning';

export function CustomerWarnings({ customers }: { customers: CustomerSummary[] }) {
  return customers.map((customer) =>
    customer.warning ? (
      <BlacklistWarning
        acknowledgementId={`customer-warning-${customer.id}`}
        customerName={customer.name}
        key={customer.id}
        reason={customer.warning.reason}
      />
    ) : null,
  );
}
