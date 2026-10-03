import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ViewState } from '@/shared/ui/ViewState';
import type { useCustomerPage } from '@/features/customers/hooks/use-customer-page';

export function CustomerEmptyState({ page }: { page: ReturnType<typeof useCustomerPage> }) {
  const { t } = useTranslation();
  const copy = page.search
    ? { title: 'noResultsTitle', description: 'noResultsBody' }
    : { title: 'customerEmptyTitle', description: 'customerEmptyBody' };
  const action = page.search ? (
    <Button onClick={() => page.updateSearch('')} type="button" variant="outline">
      {t('clearFilters')}
    </Button>
  ) : (
    <Button onClick={() => page.setFormOpen(true)} type="button">
      {t('addCustomer')}
    </Button>
  );
  return <ViewState action={action} copy={copy} heading="section" state="empty" />;
}
