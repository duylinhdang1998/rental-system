import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ViewState } from '@/shared/ui/ViewState';

const EMPTY_COPY = { description: 'contractListEmptyBody', title: 'contractListEmptyTitle' };

export function ContractEmptyState({ filtered }: { filtered: boolean }) {
  const { t } = useTranslation();
  return (
    <ViewState
      copy={filtered ? { title: 'noResultsTitle', description: 'noResultsBody' } : EMPTY_COPY}
      heading="section"
      state="empty"
      action={
        <Button asChild variant="outline">
          <Link to={filtered ? '/contracts' : '/contracts/new'}>
            {t(filtered ? 'clearFilters' : 'createContract')}
          </Link>
        </Button>
      }
    />
  );
}
