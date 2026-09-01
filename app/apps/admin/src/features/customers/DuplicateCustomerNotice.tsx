import type { CustomerSummary } from '@rental/contracts';
import { CopyCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DuplicateCustomerNoticeProps {
  customers: CustomerSummary[];
}

export function DuplicateCustomerNotice({ customers }: DuplicateCustomerNoticeProps) {
  const { t } = useTranslation();
  if (!customers.length) return null;
  return (
    <aside className="rounded-control border border-caution bg-caution-soft p-3 text-caution">
      <div className="flex items-center gap-2 font-extrabold">
        <CopyCheck aria-hidden className="size-5" />
        {t('duplicateCustomerTitle')}
      </div>
      <p className="mt-1 text-sm">{t('duplicateCustomerHelp')}</p>
      {customers.map((customer) => (
        <button
          className="button-base mt-3 border border-caution bg-panel text-caution"
          key={customer.id}
          type="button"
        >
          {t('openExistingCustomer', { name: customer.name })}
        </button>
      ))}
    </aside>
  );
}
