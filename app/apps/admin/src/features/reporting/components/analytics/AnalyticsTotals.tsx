import type { AnalyticsTotals as AnalyticsTotalsData } from '@rental/contracts';
import { CalendarDays, Coins, Layers, TrendingUp, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  analyticsTotalCards,
  type AnalyticsTotalCard,
} from '@/features/reporting/lib/analytics-presentation';
import { resolveInitialLocale } from '@/shared/i18n/locale';
import { KpiCard } from '@/shared/ui/KpiCard';

interface AnalyticsTotalsProps {
  totals: AnalyticsTotalsData;
}

const CARD_STYLE: Record<AnalyticsTotalCard['key'], { icon: LucideIcon; tone: string }> = {
  rentalDays: { icon: CalendarDays, tone: 'bg-information-soft text-information' },
  revenueVnd: { icon: TrendingUp, tone: 'bg-positive-soft text-positive' },
  surchargeNetVnd: { icon: Coins, tone: 'bg-brand-soft text-brand-ink' },
  unallocatedVnd: { icon: Layers, tone: 'bg-panel-subtle text-ink-muted' },
};

export function AnalyticsTotals({ totals }: AnalyticsTotalsProps) {
  const { i18n, t } = useTranslation();
  const cards = analyticsTotalCards(totals, resolveInitialLocale(i18n.language));
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5" data-analytics-totals>
      {cards.map((card) => (
        <KpiCard
          context={t(`analyticsKpi.${card.key}`, card.contextParams)}
          icon={CARD_STYLE[card.key].icon}
          key={card.key}
          label={t(`analyticsTotals.${card.key}`)}
          tone={CARD_STYLE[card.key].tone}
          value={card.value}
        />
      ))}
    </div>
  );
}
