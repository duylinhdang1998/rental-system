import { useTranslation } from 'react-i18next';

interface CalendarHeaderRowProps {
  days: string[];
}
const MONTH_DAY_INDEX = 5;

export function CalendarHeaderRow({ days }: CalendarHeaderRowProps) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-8 gap-2 text-xs font-bold text-ink-muted" role="row">
      <div className="min-w-36 p-2" role="columnheader">
        {t('vehicles')}
      </div>
      {days.map((day) => (
        <div className="min-w-24 p-2 text-center" key={day} role="columnheader">
          {day.slice(MONTH_DAY_INDEX)}
        </div>
      ))}
    </div>
  );
}
