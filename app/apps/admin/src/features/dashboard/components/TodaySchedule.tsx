import { useTranslation } from 'react-i18next';
import { ScheduleItem } from './ScheduleItem';
import { Button } from '@/components/ui/button';

const SCHEDULE = [
  {
    contract: 'HD-0271',
    customer: 'Nguyễn Minh An',
    statusKey: 'scheduleDueSoon',
    time: '10:30',
    vehicle: '43A1-909.12',
  },
  {
    contract: 'HD-0275',
    customer: 'Emma Wilson',
    statusKey: 'scheduleConfirmed',
    time: '13:00',
    vehicle: '43A1-552.18',
  },
];

export function TodaySchedule() {
  const { t } = useTranslation();
  return (
    <section className="surface-card p-5 lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-ink">{t('scheduleTitle')}</h2>
        <Button type="button" variant="outline">
          {t('all')}
        </Button>
      </div>
      <div className="grid gap-3">
        {SCHEDULE.map((item) => (
          <ScheduleItem key={item.contract} {...item} />
        ))}
      </div>
    </section>
  );
}
