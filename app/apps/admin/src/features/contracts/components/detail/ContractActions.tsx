import type { ContractStatus } from '@rental/contracts';
import { BadgeCheck, Ban, CalendarPlus, KeyRound, Receipt, Repeat } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  contractActions,
  type ContractAction,
} from '@/features/contracts/lib/contract-presentation';

interface ContractActionsProps {
  onAction: (action: ContractAction) => void;
  settled: boolean;
  status: ContractStatus;
}

const ACTION_CONFIG = {
  activate: { icon: KeyRound, labelKey: 'contractActivate', variant: 'default' },
  cancel: { icon: Ban, labelKey: 'contractCancel', variant: 'destructive' },
  charge: { icon: Receipt, labelKey: 'chargeAdd', variant: 'outline' },
  extend: { icon: CalendarPlus, labelKey: 'contractExtend', variant: 'outline' },
  settle: { icon: BadgeCheck, labelKey: 'settle', variant: 'default' },
  swap: { icon: Repeat, labelKey: 'contractSwap', variant: 'outline' },
} as const;

export function ContractActions({ onAction, settled, status }: ContractActionsProps) {
  const { t } = useTranslation();
  const actions = contractActions(status, settled);
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
