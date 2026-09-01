import { AlertCircle, Bike, CalendarClock, Route } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { KpiCard } from '../../../shared/ui/KpiCard';
import type { DemoDashboard } from '@rental/contracts';

const KPI_ITEMS = [
  {
    context: '+2',
    dataKey: 'availableVehicles',
    icon: Bike,
    labelKey: 'availableVehicles',
    tone: 'bg-positive-soft text-positive',
  },
  {
    context: '3',
    dataKey: 'activeRentals',
    icon: Route,
    labelKey: 'activeRentals',
    tone: 'bg-information-soft text-information',
  },
  {
    context: '10:30',
    dataKey: 'dueToday',
    icon: CalendarClock,
    labelKey: 'dueToday',
    tone: 'bg-caution-soft text-caution',
  },
  {
    context: '6h',
    dataKey: 'overdue',
    icon: AlertCircle,
    labelKey: 'overdue',
    tone: 'bg-negative-soft text-negative',
  },
] as const;

export function KpiGrid({ dashboard }: { dashboard: DemoDashboard }) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
      {KPI_ITEMS.map((item) => (
        <KpiCard
          context={item.context}
          icon={item.icon}
          key={item.dataKey}
          label={t(item.labelKey)}
          tone={item.tone}
          value={String(dashboard[item.dataKey])}
        />
      ))}
    </div>
  );
}
