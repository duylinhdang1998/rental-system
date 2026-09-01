import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../shared/ui/Button';

interface CustomerPageHeaderProps {
  onAdd: () => void;
}

export function CustomerPageHeader({ onAdd }: CustomerPageHeaderProps) {
  const { t } = useTranslation();
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-brand">
          {t('customerWorkspace')}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold">{t('customers')}</h1>
        <p className="mt-1 text-ink-muted">{t('customerSubtitle')}</p>
      </div>
      <Button onClick={onAdd} type="button">
        <Plus aria-hidden className="size-5" />
        {t('addCustomer')}
      </Button>
    </header>
  );
}
