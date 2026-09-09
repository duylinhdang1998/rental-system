import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ContractSuccessActions } from '@/features/contracts/components/success/ContractSuccessActions';
import { formatDateTime, resolveInitialLocale } from '@/shared/i18n/locale';

interface ContractSuccessProps {
  code?: string;
  contractId?: string;
  createdAt?: string;
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
      <ContractSuccessActions contractId={contractId} />
    </div>
  );
}
