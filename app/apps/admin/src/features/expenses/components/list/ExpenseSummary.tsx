import type { ExpenseList } from '@rental/contracts';
import { Banknote, Landmark, TrendingDown, Undo2, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency, resolveInitialLocale } from '@/shared/i18n/locale';
import { KpiCard } from '@/shared/ui/KpiCard';

interface ExpenseSummaryProps {
  list: ExpenseList;
}

type TotalKey = 'cashVnd' | 'netVnd' | 'reversedVnd' | 'transferVnd';

const CARDS: { icon: LucideIcon; key: TotalKey; labelKey: string; tone: string }[] = [
  {
    icon: TrendingDown,
    key: 'netVnd',
    labelKey: 'expenseNet',
    tone: 'bg-negative-soft text-negative',
  },
  { icon: Banknote, key: 'cashVnd', labelKey: 'expenseCash', tone: 'bg-brand-soft text-brand-ink' },
  {
    icon: Landmark,
    key: 'transferVnd',
    labelKey: 'expenseTransfer',
    tone: 'bg-information-soft text-information',
  },
  {
    icon: Undo2,
    key: 'reversedVnd',
    labelKey: 'expenseReversed',
    tone: 'bg-caution-soft text-caution',
  },
];

export function ExpenseSummary({ list }: ExpenseSummaryProps) {
  const { i18n, t } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  const contexts: Record<TotalKey, string> = {
    cashVnd: t('expenseKpiEntries', { count: list.count }),
    netVnd: t('expenseKpiCategories', { count: list.totals.byCategory.length }),
    reversedVnd: t('expenseKpiReversed'),
    transferVnd: t('expenseKpiEntries', { count: list.count }),
  };
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5" data-expense-totals>
      {CARDS.map((card) => (
        <KpiCard
          context={contexts[card.key]}
          icon={card.icon}
          key={card.key}
          label={t(card.labelKey)}
          tone={card.tone}
          value={formatCurrency(list.totals[card.key], locale)}
        />
      ))}
    </div>
  );
}
