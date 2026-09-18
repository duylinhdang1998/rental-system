import type { RentalContract, SettlementStatement } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { DepositRefundBadge } from '@/features/contracts/components/settlement/DepositRefundBadge';
import { SettlementOutcomeBadge } from '@/features/contracts/components/settlement/SettlementOutcomeBadge';
import { formatDateTime, resolveInitialLocale } from '@/shared/i18n/locale';
import { StatusBadge } from '@/shared/ui/StatusBadge';

interface SettlementStatusProps {
  contract: RentalContract;
  statement: SettlementStatement | undefined;
}

export function SettlementStatus({ contract, statement }: SettlementStatusProps) {
  const { i18n, t } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  if (contract.settledAt && contract.settlement) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
        <StatusBadge label={t('settlementSettledBadge')} tone="success" />
        <span>
          {t('settlementSettledAt', { time: formatDateTime(contract.settledAt, locale) })}
        </span>
        <DepositRefundBadge settlement={contract.settlement} />
      </div>
    );
  }
  if (!statement) return null;
  if (statement.ready) return <SettlementOutcomeBadge figures={statement} />;
  return (
    <p className="text-sm font-semibold text-caution">
      {t('settlementOpenVehicles', { codes: statement.openVehicleCodes.join(', ') })}
    </p>
  );
}
