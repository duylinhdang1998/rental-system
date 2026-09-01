import { ViewState } from '../../shared/ui/ViewState';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { FleetFilterBar } from './FleetFilterBar';
import { FleetPageHeader } from './FleetPageHeader';
import { useFleetPage } from './use-fleet-page';
import { VehicleForm } from './VehicleForm';
import { VehicleList } from './VehicleList';

export function VehicleListPage() {
  const page = useFleetPage();
  if (page.fleet.isPending) return <ViewState state="loading" />;
  if (page.fleet.isError)
    return <ViewState onRetry={() => void page.fleet.refetch()} state="error" />;
  return (
    <section className="grid gap-5">
      <FleetPageHeader
        onAdd={() => page.setFormOpen(true)}
        onCalendar={() => page.setCalendarOpen((open) => !open)}
      />
      {page.formOpen ? <VehicleForm onClose={() => page.setFormOpen(false)} /> : null}
      <FleetFilterBar filters={page.filters} update={page.update} />
      {page.calendarOpen ? (
        <AvailabilityCalendar
          from={page.calendarFrom}
          onFromChange={page.setCalendarFrom}
          typeCode={page.filters.typeCode}
        />
      ) : null}
      {page.fleet.data.items.length ? (
        <VehicleList vehicles={page.fleet.data.items} />
      ) : (
        <ViewState state="empty" />
      )}
    </section>
  );
}
