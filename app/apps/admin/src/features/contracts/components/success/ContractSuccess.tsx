import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { clearContractState } from '@/features/contracts/lib/contract-draft';
import { Button } from '@/components/ui/button';
import { formatDateTime, resolveInitialLocale } from '@/shared/i18n/locale';

interface ContractSuccessProps {
  code?: string;
  contractId?: string;
  createdAt?: string;
}

function createAnotherContract() {
  clearContractState();
  window.location.assign('/contracts');
}

export function ContractSuccess({ code, contractId, createdAt }: ContractSuccessProps) {
  const { i18n, t } = useTranslation();
  return (
    <div
      className="grid justify-items-start gap-4 rounded-card bg-positive-soft p-6 text-positive"
      role="status"
    >
      <CheckCircle2 aria-hidden className="size-10" />
      <h2 className="text-2xl font-extrabold">
        {t('contractCreated')} {code}
      </h2>
      {createdAt ? (
        <p className="font-semibold">
          {t('createdAt')}: {formatDateTime(createdAt, resolveInitialLocale(i18n.language))}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <a href={`/api/contracts/${contractId}/pdf`}>{t('contractDownloadPdf')}</a>
        </Button>
        <Button onClick={createAnotherContract} type="button" variant="outline">
          {t('contractCreateAnother')}
        </Button>
      </div>
    </div>
  );
}
