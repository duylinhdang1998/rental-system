import type { OperationsBoard } from '@rental/contracts';
import type { TFunction } from 'i18next';
import { AlertCircle, Bike, CalendarClock, Route } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { KpiCard } from '@/shared/ui/KpiCard';
import { rentedSharePercent } from '@/features/dashboard/lib/board-presentation';
import { formatTime, resolveInitialLocale, type Locale } from '@/shared/i18n/locale';

interface KpiGridProps {
  board: OperationsBoard;
}

type KpiKey = 'activeRentals' | 'availableVehicles' | 'dueToday' | 'overdue';

const KPI_CARDS: { icon: typeof Bike; key: KpiKey; tone: string }[] = [
  { icon: Bike, key: 'availableVehicles', tone: 'bg-positive-soft text-positive' },
  { icon: Route, key: 'activeRentals', tone: 'bg-information-soft text-information' },
  { icon: CalendarClock, key: 'dueToday', tone: 'bg-caution-soft text-caution' },
  { icon: AlertCircle, key: 'overdue', tone: 'bg-negative-soft text-negative' },
];

function kpiContexts(board: OperationsBoard, t: TFunction, locale: Locale): Record<KpiKey, string> {
  const nearest = board.nearestDueAt ? formatTime(board.nearestDueAt, locale) : null;
  return {
    activeRentals: t('kpiRentedShare', { percent: rentedSharePercent(board.fleet) }),
    availableVehicles: t('kpiFleetTotal', { count: board.fleet.total }),
    dueToday: nearest ? t('kpiNearestDue', { time: nearest }) : t('kpiNoDue'),
    overdue: board.overdue ? t('kpiMaxLate', { hours: board.maxOverdueHours }) : t('kpiNoOverdue'),
  };
}

export function KpiGrid({ board }: KpiGridProps) {
  const { i18n, t } = useTranslation();
  const contexts = kpiContexts(board, t, resolveInitialLocale(i18n.language));
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
      {KPI_CARDS.map((card) => (
        <KpiCard
          context={contexts[card.key]}
          icon={card.icon}
          key={card.key}
          label={t(card.key)}
          tone={card.tone}
          value={String(board[card.key])}
        />
      ))}
    </div>
  );
}
