import { useState } from 'react';
import type { Vehicle } from '@rental/contracts';
import { todayIso } from '@/features/fleet/hooks/use-fleet-calendar';

/** Open/closed state of the three fleet dialogs: create, calendar and cost basis. */
export function useFleetDialogs() {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [calendarFrom, setCalendarFrom] = useState(todayIso());
  const [acquisitionTarget, setAcquisitionTarget] = useState<Vehicle | null>(null);
  return {
    acquisitionTarget,
    calendarFrom,
    calendarOpen,
    formOpen,
    setAcquisitionTarget,
    setCalendarFrom,
    setCalendarOpen,
    setFormOpen,
  };
}

export type FleetDialogState = ReturnType<typeof useFleetDialogs>;
