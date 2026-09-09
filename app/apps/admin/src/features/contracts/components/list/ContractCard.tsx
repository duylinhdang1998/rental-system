import type { ContractSummary } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ContractStatusBadge } from '@/features/contracts/components/list/ContractStatusBadge';
import { formatCurrency, formatDateTime, resolveInitialLocale } from '@/shared/i18n/locale';

interface ContractCardProps {
  contract: ContractSummary;
}

export function ContractCard({ contract }: ContractCardProps) {
  const { i18n, t } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  return (
    <article className="surface-card grid gap-3 p-4 sm:hidden" data-mobile-card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-ink-muted">{contract.vehicleCodes.join(', ')}</p>
          <h2 className="text-lg font-extrabold text-ink">{contract.code}</h2>
          <p className="text-ink-muted">{contract.customerName}</p>
        </div>
        <ContractStatusBadge status={contract.status} />
      </div>
      <p className="text-sm text-ink-muted">
        {formatDateTime(contract.startAt, locale)} → {formatDateTime(contract.endAt, locale)}
      </p>
      <p className="text-xl font-black text-brand">{formatCurrency(contract.totalVnd, locale)}</p>
      <Button asChild variant="outline">
        <Link to={`/contracts/${contract.id}`}>{t('viewDetails')}</Link>
      </Button>
    </article>
  );
}
