import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  SCHEDULE_FILTERS,
  type ScheduleFilter as ScheduleFilterValue,
} from '@/features/dashboard/lib/board-presentation';

interface ScheduleFilterProps {
  onChange: (value: ScheduleFilterValue) => void;
  value: ScheduleFilterValue;
}

const FILTER_LABEL_KEYS: Record<ScheduleFilterValue, string> = {
  ALL: 'all',
  PICKUP: 'schedulePickups',
  RETURN: 'scheduleReturns',
};

export function ScheduleFilter({ onChange, value }: ScheduleFilterProps) {
  const { t } = useTranslation();
  return (
    <div aria-label={t('scheduleFilter')} className="flex flex-wrap gap-2" role="group">
      {SCHEDULE_FILTERS.map((filter) => (
        <Button
          aria-pressed={filter === value}
          key={filter}
          onClick={() => onChange(filter)}
          size="sm"
          type="button"
          variant={filter === value ? 'default' : 'outline'}
        >
          {t(FILTER_LABEL_KEYS[filter])}
        </Button>
      ))}
    </div>
  );
}
