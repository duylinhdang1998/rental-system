import { useTranslation } from 'react-i18next';
import { CalendarControls } from './CalendarControls';

interface CalendarToolbarProps {
  from: string;
  onFromChange: (date: string) => void;
  to: string;
}

export function CalendarToolbar({ from, onFromChange, to }: CalendarToolbarProps) {
  const { t } = useTranslation();
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-extrabold" id="calendar-title">
          {t('fleetCalendar')}
        </h2>
        <p className="text-sm text-ink-muted">
          {from} – {to}
        </p>
      </div>
      <CalendarControls from={from} onFromChange={onFromChange} />
    </div>
  );
}
