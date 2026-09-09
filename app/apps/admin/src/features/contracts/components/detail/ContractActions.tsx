import type { ContractStatus } from '@rental/contracts';
import { Ban, CalendarPlus, CheckCircle2, KeyRound, Repeat } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  contractActions,
  type ContractAction,
} from '@/features/contracts/lib/contract-presentation';

interface ContractActionsProps {
  onAction: (action: ContractAction) => void;
  status: ContractStatus;
}

const ACTION_CONFIG = {
  activate: { icon: KeyRound, labelKey: 'contractActivate', variant: 'default' },
  cancel: { icon: Ban, labelKey: 'contractCancel', variant: 'destructive' },
  complete: { icon: CheckCircle2, labelKey: 'contractComplete', variant: 'default' },
  extend: { icon: CalendarPlus, labelKey: 'contractExtend', variant: 'outline' },
  swap: { icon: Repeat, labelKey: 'contractSwap', variant: 'outline' },
} as const;

export function ContractActions({ onAction, status }: ContractActionsProps) {
  const { t } = useTranslation();
  const actions = contractActions(status);
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
