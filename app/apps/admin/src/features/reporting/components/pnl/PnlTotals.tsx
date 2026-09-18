import type { PnlTotals as PnlTotalsData } from '@rental/contracts';
import { Coins, PiggyBank, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { pnlTotalCards, type PnlTotalKey } from '@/features/reporting/lib/pnl-presentation';
import { resolveInitialLocale } from '@/shared/i18n/locale';
import { KpiCard } from '@/shared/ui/KpiCard';

interface PnlTotalsProps {
  totals: PnlTotalsData;
}

const CARD_STYLE: Record<PnlTotalKey, { icon: LucideIcon; tone: string }> = {
  depreciationVnd: { icon: PiggyBank, tone: 'bg-information-soft text-information' },
  expensesVnd: { icon: TrendingDown, tone: 'bg-negative-soft text-negative' },
  profitVnd: { icon: Coins, tone: 'bg-brand-soft text-brand-ink' },
  revenueVnd: { icon: TrendingUp, tone: 'bg-positive-soft text-positive' },
};

export function PnlTotals({ totals }: PnlTotalsProps) {
  const { i18n, t } = useTranslation();
  const cards = pnlTotalCards(totals, resolveInitialLocale(i18n.language));
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5" data-pnl-totals>
      {cards.map((card) => (
        <KpiCard
          context={t(`pnlKpi.${card.key}`)}
          icon={CARD_STYLE[card.key].icon}
          key={card.key}
          label={t(`pnlTotals.${card.key}`)}
          tone={CARD_STYLE[card.key].tone}
          value={card.value}
        />
      ))}
    </div>
  );
}
