import type { VehicleCalendarRow } from '@rental/contracts';
import { AvailabilityDay } from '@/features/fleet/components/calendar/AvailabilityDay';

interface CalendarVehicleRowProps {
  vehicle: VehicleCalendarRow;
}

export function CalendarVehicleRow({ vehicle }: CalendarVehicleRowProps) {
  return (
    <div className="grid grid-cols-8 gap-2" role="row">
      <div className="min-w-36 p-2" role="rowheader">
        <span className="block font-extrabold">{vehicle.plate}</span>
        <span className="text-xs text-ink-muted">{vehicle.code}</span>
      </div>
      {vehicle.periods.map((period) => (
        <AvailabilityDay key={period.date} period={period} vehicleId={vehicle.id} />
      ))}
    </div>
  );
}
