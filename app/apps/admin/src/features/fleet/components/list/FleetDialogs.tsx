import { VehicleAcquisitionDialog } from '@/features/fleet/components/acquisition/VehicleAcquisitionDialog';
import { AvailabilityCalendarDialog } from '@/features/fleet/components/calendar/AvailabilityCalendarDialog';
import { VehicleCreateDialog } from '@/features/fleet/components/form/VehicleCreateDialog';
import type { FleetDialogState } from '@/features/fleet/hooks/use-fleet-dialogs';

interface FleetDialogsProps {
  dialogs: FleetDialogState;
  typeCode: string | undefined;
}

/** The three fleet dialogs, mounted once next to the list. */
export function FleetDialogs({ dialogs, typeCode }: FleetDialogsProps) {
  return (
    <>
      <VehicleCreateDialog onOpenChange={dialogs.setFormOpen} open={dialogs.formOpen} />
      <AvailabilityCalendarDialog
        from={dialogs.calendarFrom}
        onFromChange={dialogs.setCalendarFrom}
        onOpenChange={dialogs.setCalendarOpen}
        open={dialogs.calendarOpen}
        typeCode={typeCode}
      />
      {dialogs.acquisitionTarget ? (
        <VehicleAcquisitionDialog
          onClose={() => dialogs.setAcquisitionTarget(null)}
          vehicle={dialogs.acquisitionTarget}
        />
      ) : null}
    </>
  );
}
