import type { CustomerSummary } from '@rental/contracts';
import { CopyCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

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
        <Button className="mt-3" key={customer.id} type="button" variant="outline">
          {t('openExistingCustomer', { name: customer.name })}
        </Button>
      ))}
    </aside>
  );
}
