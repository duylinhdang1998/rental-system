import type { ContractSettlement } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from '@/shared/ui/StatusBadge';

interface DepositRefundBadgeProps {
  settlement: ContractSettlement;
}

/** Shown only when the settlement owes money back; flips once the refund row exists (US-028). */
export function DepositRefundBadge({ settlement }: DepositRefundBadgeProps) {
  const { t } = useTranslation();
  if (settlement.refundVnd <= 0) return null;
  const done = settlement.depositRefunded;
  return (
    <span data-deposit-refund-state={done ? 'done' : 'pending'}>
      <StatusBadge
        label={t(done ? 'depositRefundedBadge' : 'depositRefundPendingBadge')}
        tone={done ? 'success' : 'warning'}
      />
    </span>
  );
}
