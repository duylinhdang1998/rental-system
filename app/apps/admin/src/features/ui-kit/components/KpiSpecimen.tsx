import { Bike, CalendarClock, Users } from 'lucide-react';
import { KpiCard } from '@/shared/ui/KpiCard';

const KPI_SPECIMENS = [
  ['12 xe đang sẵn sàng', Bike, 'Tổng xe', 'bg-brand-soft text-brand', '24'],
  ['3 lượt hôm nay', CalendarClock, 'Lịch thuê', 'bg-information-soft text-information', '08'],
  ['Tăng 6 trong tháng', Users, 'Khách hàng', 'bg-positive-soft text-positive', '156'],
] as const;

export function KpiSpecimen() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {KPI_SPECIMENS.map(([context, icon, label, tone, value]) => (
        <KpiCard
          context={context}
          icon={icon}
          key={label}
          label={label}
          tone={tone}
          value={value}
        />
      ))}
    </div>
  );
}
