import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { moveCalendar } from '@/features/fleet/hooks/use-fleet-calendar';
import { Button } from '@/components/ui/button';

interface CalendarControlsProps {
  from: string;
  onFromChange: (date: string) => void;
}

export function CalendarControls({ from, onFromChange }: CalendarControlsProps) {
  const { t } = useTranslation();
  return (
    <div className="flex gap-2">
      <Button
        aria-label={t('previousWeek')}
        onClick={() => onFromChange(moveCalendar(from, -1))}
        size="icon"
        type="button"
        variant="outline"
      >
        <ChevronLeft aria-hidden />
      </Button>
      <Button
        aria-label={t('nextWeek')}
        onClick={() => onFromChange(moveCalendar(from, 1))}
        size="icon"
        type="button"
        variant="outline"
      >
        <ChevronRight aria-hidden />
      </Button>
    </div>
  );
}
