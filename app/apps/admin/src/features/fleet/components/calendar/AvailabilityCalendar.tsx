import { ViewState } from '@/shared/ui/ViewState';
import { CalendarGrid } from '@/features/fleet/components/calendar/CalendarGrid';
import { CalendarToolbar } from '@/features/fleet/components/calendar/CalendarToolbar';
import { useFleetCalendar } from '@/features/fleet/hooks/use-fleet-calendar';

interface AvailabilityCalendarProps {
  from: string;
  onFromChange: (date: string) => void;
  typeCode?: string;
}

export function AvailabilityCalendar({ from, onFromChange, typeCode }: AvailabilityCalendarProps) {
  const calendar = useFleetCalendar(from, typeCode);
  if (calendar.isPending) return <ViewState state="loading" />;
  if (calendar.isError) return <ViewState onRetry={() => void calendar.refetch()} state="error" />;
  return (
    <section className="surface-card min-w-0 p-4" aria-labelledby="calendar-title">
      <CalendarToolbar from={from} onFromChange={onFromChange} to={calendar.to} />
      <CalendarGrid calendar={calendar.data} />
    </section>
  );
}
