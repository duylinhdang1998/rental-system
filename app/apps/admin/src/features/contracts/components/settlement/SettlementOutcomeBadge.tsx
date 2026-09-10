import type { SettlementFigures } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import {
  OUTCOME_LABEL_KEYS,
  OUTCOME_TONES,
  outcomeAmount,
  settlementOutcome,
} from '@/features/contracts/lib/settlement-presentation';
import { formatCurrency, resolveInitialLocale } from '@/shared/i18n/locale';
import { StatusBadge } from '@/shared/ui/StatusBadge';

interface SettlementOutcomeBadgeProps {
  figures: SettlementFigures;
}

/** BR-04: direction first (collect or refund), then the amount. */
export function SettlementOutcomeBadge({ figures }: SettlementOutcomeBadgeProps) {
  const { i18n, t } = useTranslation();
  const outcome = settlementOutcome(figures);
  const amount = outcomeAmount(figures);
  return (
    <div className="flex flex-wrap items-center gap-2" data-settlement-outcome={outcome}>
      <StatusBadge label={t(OUTCOME_LABEL_KEYS[outcome])} tone={OUTCOME_TONES[outcome]} />
      {amount > 0 ? (
        <strong className="text-ink">
          {formatCurrency(amount, resolveInitialLocale(i18n.language))}
        </strong>
      ) : null}
    </div>
  );
}
