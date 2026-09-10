import type { SettlementFigures } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { SettlementOutcomeBadge } from '@/features/contracts/components/settlement/SettlementOutcomeBadge';
import {
  depositCap,
  type SettleFormValues,
} from '@/features/contracts/lib/settlement-presentation';
import { formatCurrency, resolveInitialLocale } from '@/shared/i18n/locale';
import { TextField } from '@/shared/ui/TextField';

interface SettleDepositFieldProps {
  onChange: (field: 'depositApplied', value: SettleFormValues['depositApplied']) => void;
  preview: SettlementFigures;
  value: string;
}

export function SettleDepositField({ onChange, preview, value }: SettleDepositFieldProps) {
  const { i18n, t } = useTranslation();
  const cap = depositCap(preview);
  return (
    <div className="grid gap-2">
      <TextField
        data-dialog-autofocus=""
        id="settle-deposit-applied"
        inputMode="numeric"
        label={t('settleDepositApplied')}
        max={cap}
        min={0}
        onChange={(event) => onChange('depositApplied', event.target.value)}
        type="number"
        value={value}
      />
      <p className="text-sm text-ink-muted">
        {t('settleDepositCap', {
          amount: formatCurrency(cap, resolveInitialLocale(i18n.language)),
        })}
      </p>
      <SettlementOutcomeBadge figures={preview} />
    </div>
  );
}
