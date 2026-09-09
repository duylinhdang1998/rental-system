import type { BoardItem } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { ScheduleFilter } from '@/features/dashboard/components/ScheduleFilter';
import { ScheduleItem } from '@/features/dashboard/components/ScheduleItem';
import { useScheduleFilter } from '@/features/dashboard/hooks/use-schedule-filter';
import { scheduleItems } from '@/features/dashboard/lib/board-presentation';

interface TodayScheduleProps {
  items: BoardItem[];
}

export function TodaySchedule({ items }: TodayScheduleProps) {
  const { t } = useTranslation();
  const { filter, setFilter } = useScheduleFilter();
  const visible = scheduleItems(items, filter);
  return (
    <section className="surface-card p-5 lg:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-ink">{t('scheduleTitle')}</h2>
        <ScheduleFilter onChange={setFilter} value={filter} />
      </div>
      <div className="grid gap-3">
        {visible.map((item) => (
          <ScheduleItem item={item} key={item.contractId} />
        ))}
        {visible.length ? null : <p className="text-ink-muted">{t('scheduleEmpty')}</p>}
      </div>
    </section>
  );
}
