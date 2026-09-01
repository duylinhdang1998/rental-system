import type { CustomerSummary } from '@rental/contracts';
import { useTranslation } from 'react-i18next';

interface Props {
  customers: CustomerSummary[];
  customerId: string;
  onChange: (id: string) => void;
}

export function CustomerOptions({ customers, customerId, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <fieldset className="grid gap-3">
      <legend className="mb-2 text-lg font-extrabold">{t('contractCustomer')}</legend>
      {customers.map((customer) => (
        <div
          className={`surface-card flex min-h-touch items-center gap-3 p-4 ${customerId === customer.id ? 'border-brand bg-brand-soft' : ''}`}
          key={customer.id}
        >
          <input
            aria-label={customer.name}
            checked={customerId === customer.id}
            name="customer"
            onChange={() => onChange(customer.id)}
            required
            type="radio"
          />
          <span>
            <strong>{customer.name}</strong>
            <small className="block text-ink-muted">{customer.contacts[0]?.value}</small>
          </span>
        </div>
      ))}
    </fieldset>
  );
}
