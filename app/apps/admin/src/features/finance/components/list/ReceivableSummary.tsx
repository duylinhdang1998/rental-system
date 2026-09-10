import type { ReceivableList } from '@rental/contracts';
import { FileText, HandCoins, Hourglass, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { oldestOutstandingDays } from '@/features/finance/lib/receivable-presentation';
import { formatCurrency, resolveInitialLocale } from '@/shared/i18n/locale';
import { KpiCard } from '@/shared/ui/KpiCard';

interface ReceivableSummaryProps {
  list: ReceivableList;
}

type SummaryKey = 'count' | 'overSevenDays' | 'totalRemainingVnd';

const CARDS: { icon: LucideIcon; key: SummaryKey; labelKey: string; tone: string }[] = [
  {
    icon: HandCoins,
    key: 'totalRemainingVnd',
    labelKey: 'receivableTotal',
    tone: 'bg-negative-soft text-negative',
  },
  {
    icon: FileText,
    key: 'count',
    labelKey: 'receivableCount',
    tone: 'bg-information-soft text-information',
  },
  {
    icon: Hourglass,
    key: 'overSevenDays',
    labelKey: 'receivableOverSeven',
    tone: 'bg-caution-soft text-caution',
  },
];

export function ReceivableSummary({ list }: ReceivableSummaryProps) {
  const { i18n, t } = useTranslation();
  const oldest = oldestOutstandingDays(list.items);
  const values: Record<SummaryKey, string> = {
    count: String(list.count),
    overSevenDays: String(list.overSevenDays),
    totalRemainingVnd: formatCurrency(list.totalRemainingVnd, resolveInitialLocale(i18n.language)),
  };
  const contexts: Record<SummaryKey, string> = {
    count: oldest ? t('receivableKpiOldest', { count: oldest }) : t('receivableKpiNone'),
    overSevenDays: t('receivableKpiOverSeven'),
    totalRemainingVnd: t('receivableKpiContracts', { count: list.count }),
  };
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5">
      {CARDS.map((card) => (
        <KpiCard
          context={contexts[card.key]}
          icon={card.icon}
          key={card.key}
          label={t(card.labelKey)}
          tone={card.tone}
          value={values[card.key]}
        />
      ))}
    </div>
  );
}
