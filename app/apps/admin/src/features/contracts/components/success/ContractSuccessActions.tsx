import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { clearContractState } from '@/features/contracts/lib/contract-draft';
import { Button } from '@/components/ui/button';

interface ContractSuccessActionsProps {
  contractId?: string;
}

function createAnotherContract() {
  clearContractState();
  window.location.assign('/contracts/new');
}

export function ContractSuccessActions({ contractId }: ContractSuccessActionsProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap gap-3">
      <Button asChild>
        <a href={`/api/contracts/${contractId}/pdf`}>{t('contractDownloadPdf')}</a>
      </Button>
      <Button asChild variant="outline">
        <Link onClick={clearContractState} to={`/contracts/${contractId}`}>
          {t('contractView')}
        </Link>
      </Button>
      <Button onClick={createAnotherContract} type="button" variant="outline">
        {t('contractCreateAnother')}
      </Button>
    </div>
  );
}
