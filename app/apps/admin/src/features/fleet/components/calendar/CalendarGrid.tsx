import type { FleetCalendar } from '../../api/fleet-api';
import { useTranslation } from 'react-i18next';
import { CalendarHeaderRow } from './CalendarHeaderRow';
import { CalendarVehicleRow } from './CalendarVehicleRow';

interface CalendarGridProps {
  calendar: FleetCalendar;
}

export function CalendarGrid({ calendar }: CalendarGridProps) {
  const { t } = useTranslation();
  return (
    <div className="max-w-full overflow-x-auto pb-2">
      <div aria-label={t('fleetCalendar')} className="grid min-w-max gap-2" role="grid">
        <CalendarHeaderRow days={calendar.days} />
        {calendar.vehicles.map((vehicle) => (
          <CalendarVehicleRow key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
    </div>
  );
}
