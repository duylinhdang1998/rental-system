import type { ContractStatus } from '@rental/contracts';
import {
  BadgeCheck,
  Ban,
  CalendarPlus,
  HandCoins,
  KeyRound,
  Receipt,
  Repeat,
  Wallet,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  contractActions,
  type ContractAction,
} from '@/features/contracts/lib/contract-presentation';

interface ContractActionsProps {
  depositRefundDue: boolean;
  onAction: (action: ContractAction) => void;
  openReceivable: boolean;
  settled: boolean;
  status: ContractStatus;
}

const ACTION_CONFIG = {
  activate: { icon: KeyRound, labelKey: 'contractActivate', variant: 'default' },
  cancel: { icon: Ban, labelKey: 'contractCancel', variant: 'destructive' },
  charge: { icon: Receipt, labelKey: 'chargeAdd', variant: 'outline' },
  extend: { icon: CalendarPlus, labelKey: 'contractExtend', variant: 'outline' },
  payment: { icon: Wallet, labelKey: 'paymentRecord', variant: 'outline' },
  refundDeposit: { icon: HandCoins, labelKey: 'depositRefund', variant: 'default' },
  settle: { icon: BadgeCheck, labelKey: 'settle', variant: 'default' },
  swap: { icon: Repeat, labelKey: 'contractSwap', variant: 'outline' },
} as const;

export function ContractActions(props: ContractActionsProps) {
  const { depositRefundDue, onAction, openReceivable, settled, status } = props;
  const { t } = useTranslation();
  const actions = contractActions(status, settled, openReceivable, depositRefundDue);
  if (!actions.length) {
    return <p className="surface-card p-4 font-semibold text-ink-muted">{t('contractClosed')}</p>;
  }
  return (
    <div
      aria-label={t('contractActions')}
      className="surface-card flex flex-wrap gap-2 p-4"
      role="group"
    >
      {actions.map((action) => {
        const { icon: Icon, labelKey, variant } = ACTION_CONFIG[action];
        return (
          <Button key={action} onClick={() => onAction(action)} type="button" variant={variant}>
            <Icon aria-hidden data-icon="inline-start" />
            {t(labelKey)}
          </Button>
        );
      })}
    </div>
  );
}
