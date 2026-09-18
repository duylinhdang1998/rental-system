import type { RevenueTotals } from '@rental/contracts';
import { Banknote, Landmark, TrendingUp, Undo2, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { collectionShare } from '@/features/reporting/lib/report-presentation';
import { formatCurrency, resolveInitialLocale } from '@/shared/i18n/locale';
import { KpiCard } from '@/shared/ui/KpiCard';

interface ReportTotalsProps {
  totals: RevenueTotals;
}

type TotalKey = 'cashVnd' | 'netVnd' | 'refundVnd' | 'transferVnd';

const CARDS: { icon: LucideIcon; key: TotalKey; labelKey: string; tone: string }[] = [
  {
    icon: TrendingUp,
    key: 'netVnd',
    labelKey: 'reportNet',
    tone: 'bg-positive-soft text-positive',
  },
  { icon: Banknote, key: 'cashVnd', labelKey: 'reportCash', tone: 'bg-brand-soft text-brand-ink' },
  {
    icon: Landmark,
    key: 'transferVnd',
    labelKey: 'reportTransfer',
    tone: 'bg-information-soft text-information',
  },
  {
    icon: Undo2,
    key: 'refundVnd',
    labelKey: 'reportRefunds',
    tone: 'bg-caution-soft text-caution',
  },
];

/** BR-04: every card is one direction of money; net is the only derived figure. */
export function ReportTotals({ totals }: ReportTotalsProps) {
  const { i18n, t } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  const contexts: Record<TotalKey, string> = {
    cashVnd: t('reportKpiShare', { percent: collectionShare(totals, totals.cashVnd) }),
    netVnd: t('reportKpiPayments', { count: totals.paymentCount }),
    refundVnd: t('reportKpiContracts', { count: totals.contractCount }),
    transferVnd: t('reportKpiShare', { percent: collectionShare(totals, totals.transferVnd) }),
  };
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5" data-report-totals>
      {CARDS.map((card) => (
        <KpiCard
          context={contexts[card.key]}
          icon={card.icon}
          key={card.key}
          label={t(card.labelKey)}
          tone={card.tone}
          value={formatCurrency(totals[card.key], locale)}
        />
      ))}
    </div>
  );
}
