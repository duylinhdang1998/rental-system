import type { CustomerSummary } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { CustomerContacts } from './CustomerContacts';
import { Button } from '@/components/ui/button';
import { formatDateTime, resolveInitialLocale } from '@/shared/i18n/locale';

interface CustomerCardProps {
  customer: CustomerSummary;
}

export function CustomerCard({ customer }: CustomerCardProps) {
  const { i18n, t } = useTranslation();
  return (
    <article className="surface-card grid gap-4 p-5" data-mobile-card>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-brand">
          {customer.nationality}
        </p>
        <h2 className="mt-1 text-xl font-extrabold">{customer.name}</h2>
      </div>
      <CustomerContacts contacts={customer.contacts} />
      <div>
        <p className="text-sm text-ink-muted">{t('createdAt')}</p>
        <p className="font-bold text-ink">
          {formatDateTime(customer.createdAt, resolveInitialLocale(i18n.language))}
        </p>
      </div>
      <Button type="button" variant="outline">
        {t('viewCustomer')}
      </Button>
    </article>
  );
}
