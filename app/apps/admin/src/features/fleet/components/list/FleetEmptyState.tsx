import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ViewState } from '@/shared/ui/ViewState';

export function FleetEmptyState({ filtered, onAdd }: { filtered: boolean; onAdd: () => void }) {
  const { t } = useTranslation();
  const copy = filtered
    ? { title: 'noResultsTitle', description: 'noResultsBody' }
    : { title: 'fleetEmptyTitle', description: 'fleetEmptyBody' };
  const action = filtered ? (
    <Button asChild variant="outline">
      <Link to="/vehicles">{t('clearFilters')}</Link>
    </Button>
  ) : (
    <Button onClick={onAdd} type="button">
      {t('addVehicle')}
    </Button>
  );
  return <ViewState action={action} copy={copy} heading="section" state="empty" />;
}
