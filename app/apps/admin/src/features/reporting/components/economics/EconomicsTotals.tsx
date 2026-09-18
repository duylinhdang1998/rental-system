import type { FleetEconomicsTotals } from '@rental/contracts';
import { Coins, PiggyBank, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  economicsTotalCards,
  type EconomicsTotalKey,
} from '@/features/reporting/lib/economics-presentation';
import { resolveInitialLocale } from '@/shared/i18n/locale';
import { KpiCard } from '@/shared/ui/KpiCard';

interface EconomicsTotalsProps {
  totals: FleetEconomicsTotals;
}

const CARD_STYLE: Record<EconomicsTotalKey, { icon: LucideIcon; tone: string }> = {
  bookValueVnd: { icon: PiggyBank, tone: 'bg-information-soft text-information' },
  expensesVnd: { icon: TrendingDown, tone: 'bg-negative-soft text-negative' },
  netVnd: { icon: Coins, tone: 'bg-brand-soft text-brand-ink' },
  revenueVnd: { icon: TrendingUp, tone: 'bg-positive-soft text-positive' },
};

export function EconomicsTotals({ totals }: EconomicsTotalsProps) {
  const { i18n, t } = useTranslation();
  const cards = economicsTotalCards(totals, resolveInitialLocale(i18n.language));
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5" data-economics-totals>
      {cards.map((card) => (
        <KpiCard
          context={t(card.contextKey, card.contextParams)}
          icon={CARD_STYLE[card.key].icon}
          key={card.key}
          label={t(`economicsTotals.${card.key}`)}
          tone={CARD_STYLE[card.key].tone}
          value={card.value}
        />
      ))}
    </div>
  );
}
