import type { RentalContract } from '@rental/contracts';
import { ArrowLeft, FileDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ContractStatusBadge } from '@/features/contracts/components/list/ContractStatusBadge';
import { formatDateTime, resolveInitialLocale } from '@/shared/i18n/locale';

interface ContractDetailHeaderProps {
  contract: RentalContract;
}

export function ContractDetailHeader({ contract }: ContractDetailHeaderProps) {
  const { i18n, t } = useTranslation();
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <Link
          className="inline-flex items-center gap-1 text-sm font-bold text-brand-ink"
          to="/contracts"
        >
          <ArrowLeft aria-hidden className="size-4" />
          {t('contractBackToList')}
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-extrabold text-ink">{contract.code}</h1>
          <ContractStatusBadge status={contract.status} />
        </div>
        <p className="mt-1 text-ink-muted">
          {contract.quote.customerName} · {t('createdAt')}:{' '}
          {formatDateTime(contract.createdAt, resolveInitialLocale(i18n.language))}
        </p>
      </div>
      <Button asChild variant="outline">
        <a href={`/api/contracts/${contract.id}/pdf`}>
          <FileDown aria-hidden data-icon="inline-start" />
          {t('contractDownloadPdf')}
        </a>
      </Button>
    </header>
  );
}
