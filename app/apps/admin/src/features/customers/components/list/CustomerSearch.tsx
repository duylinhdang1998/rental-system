import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';

interface CustomerSearchProps {
  onChange: (value: string) => void;
  value: string;
}

export function CustomerSearch({ onChange, value }: CustomerSearchProps) {
  const { t } = useTranslation();
  return (
    <label className="surface-card flex items-center gap-3 p-3" htmlFor="customer-search">
      <Search aria-hidden className="size-5 text-ink-muted" />
      <span className="sr-only">{t('searchCustomers')}</span>
      <Input
        aria-label={t('searchCustomers')}
        className="min-w-0 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
        id="customer-search"
        onChange={(event) => onChange(event.target.value)}
        placeholder={t('searchCustomerPlaceholder')}
        type="search"
        value={value}
      />
    </label>
  );
}
