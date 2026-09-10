import type { ContractSummary } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from '@/shared/ui/StatusBadge';

interface ContractSettlementBadgeProps {
  contract: Pick<ContractSummary, 'settledAt' | 'status'>;
}

/** Returned contracts still carry money to close until they are settled. */
export function ContractSettlementBadge({ contract }: ContractSettlementBadgeProps) {
  const { t } = useTranslation();
  if (contract.status !== 'COMPLETED') return null;
  return contract.settledAt ? (
    <StatusBadge label={t('settlementSettledBadge')} tone="success" />
  ) : (
    <StatusBadge label={t('settlementPendingBadge')} tone="warning" />
  );
}
