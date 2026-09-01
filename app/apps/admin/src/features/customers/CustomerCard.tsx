import type { CustomerSummary } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { BlacklistWarning } from './BlacklistWarning';
import { CustomerContacts } from './CustomerContacts';

interface CustomerCardProps {
  customer: CustomerSummary;
}

export function CustomerCard({ customer }: CustomerCardProps) {
  const { t } = useTranslation();
  return (
    <article className="surface-card grid gap-4 p-5" data-mobile-card>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-brand">
          {customer.nationality}
        </p>
        <h2 className="mt-1 text-xl font-extrabold">{customer.name}</h2>
      </div>
      <CustomerContacts contacts={customer.contacts} />
      {customer.warning ? <BlacklistWarning reason={customer.warning.reason} /> : null}
      <button className="button-base border border-line bg-panel text-brand" type="button">
        {t('viewCustomer')}
      </button>
    </article>
  );
}
