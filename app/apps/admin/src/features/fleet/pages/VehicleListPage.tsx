import { ViewState } from '../../../shared/ui/ViewState';
import { AvailabilityCalendarDialog } from '../components/calendar/AvailabilityCalendarDialog';
import { FleetFilterBar } from '../components/filters/FleetFilterBar';
import { FleetPageHeader } from '../components/list/FleetPageHeader';
import { useFleetPage } from '../hooks/use-fleet-page';
import { VehicleCreateDialog } from '../components/form/VehicleCreateDialog';
import { VehicleList } from '../components/list/VehicleList';

export function VehicleListPage() {
  const page = useFleetPage();
  if (page.fleet.isPending) return <ViewState state="loading" />;
  if (page.fleet.isError)
    return <ViewState onRetry={() => void page.fleet.refetch()} state="error" />;
  return (
    <section className="grid gap-5">
      <FleetPageHeader
        onAdd={() => page.setFormOpen(true)}
        onCalendar={() => page.setCalendarOpen(true)}
      />
      <VehicleCreateDialog onOpenChange={page.setFormOpen} open={page.formOpen} />
      <FleetFilterBar filters={page.filters} update={page.update} />
      <AvailabilityCalendarDialog
        from={page.calendarFrom}
        onFromChange={page.setCalendarFrom}
        onOpenChange={page.setCalendarOpen}
        open={page.calendarOpen}
        typeCode={page.filters.typeCode}
      />
      {page.fleet.data.items.length ? (
        <VehicleList vehicles={page.fleet.data.items} />
      ) : (
        <ViewState state="empty" />
      )}
    </section>
  );
}
