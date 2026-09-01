import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
      <input
        aria-label={t('searchCustomers')}
        className="min-h-touch min-w-0 flex-1 border-0 bg-transparent text-ink outline-none"
        id="customer-search"
        onChange={(event) => onChange(event.target.value)}
        placeholder={t('searchCustomerPlaceholder')}
        type="search"
        value={value}
      />
    </label>
  );
}
