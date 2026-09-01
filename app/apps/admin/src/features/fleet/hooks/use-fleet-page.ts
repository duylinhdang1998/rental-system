import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { vehicleStatusSchema, type VehicleStatus } from '@rental/contracts';
import { todayIso } from '@/features/fleet/hooks/use-fleet-calendar';
import { useFleet } from '@/features/fleet/hooks/use-fleet';

function parsedStatus(value: string | null): VehicleStatus | undefined {
  const parsed = vehicleStatusSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

export function useFleetPage() {
  const [params, setParams] = useSearchParams();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [calendarFrom, setCalendarFrom] = useState(todayIso());
  const filters = {
    search: params.get('search') ?? undefined,
    status: parsedStatus(params.get('status')),
    typeCode: params.get('typeCode') ?? undefined,
  };
  const fleet = useFleet(filters);
  const update = (key: string, value: string) =>
    setParams((current) => {
      if (value) current.set(key, value);
      else current.delete(key);
      return current;
    });
  return {
    calendarFrom,
    calendarOpen,
    filters,
    fleet,
    formOpen,
    setCalendarFrom,
    setCalendarOpen,
    setFormOpen,
    update,
  };
}
