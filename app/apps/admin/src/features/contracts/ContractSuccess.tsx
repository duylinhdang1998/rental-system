import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { clearContractState } from './contract-draft';

export function ContractSuccess({ code, contractId }: { code?: string; contractId?: string }) {
  const { t } = useTranslation();
  const createAnother = () => {
    clearContractState();
    window.location.assign('/contracts');
  };
  return (
    <div
      className="grid justify-items-start gap-4 rounded-card bg-positive-soft p-6 text-positive"
      role="status"
    >
      <CheckCircle2 aria-hidden className="size-10" />
      <h2 className="text-2xl font-extrabold">
        {t('contractCreated')} {code}
      </h2>
      <div className="flex flex-wrap gap-3">
        <a className="button-base button-primary" href={`/api/contracts/${contractId}/pdf`}>
          {t('contractDownloadPdf')}
        </a>
        <button
          className="button-base border border-positive bg-panel"
          onClick={createAnother}
          type="button"
        >
          {t('contractCreateAnother')}
        </button>
      </div>
    </div>
  );
}
