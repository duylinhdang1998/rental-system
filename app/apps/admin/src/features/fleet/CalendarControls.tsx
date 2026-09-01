import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { moveCalendar } from './use-fleet-calendar';

interface CalendarControlsProps {
  from: string;
  onFromChange: (date: string) => void;
}

export function CalendarControls({ from, onFromChange }: CalendarControlsProps) {
  const { t } = useTranslation();
  return (
    <div className="flex gap-2">
      <button
        aria-label={t('previousWeek')}
        className="button-base border border-line bg-panel px-3 text-ink"
        onClick={() => onFromChange(moveCalendar(from, -1))}
        type="button"
      >
        <ChevronLeft aria-hidden className="size-5" />
      </button>
      <button
        aria-label={t('nextWeek')}
        className="button-base border border-line bg-panel px-3 text-ink"
        onClick={() => onFromChange(moveCalendar(from, 1))}
        type="button"
      >
        <ChevronRight aria-hidden className="size-5" />
      </button>
    </div>
  );
}
