import { ViewState } from '@/shared/ui/ViewState';
import { FleetDialogs } from '@/features/fleet/components/list/FleetDialogs';
import { FleetFilterBar } from '@/features/fleet/components/filters/FleetFilterBar';
import { FleetPageHeader } from '@/features/fleet/components/list/FleetPageHeader';
import { useFleetPage } from '@/features/fleet/hooks/use-fleet-page';
import { VehicleList } from '@/features/fleet/components/list/VehicleList';

export function VehicleListPage() {
  const page = useFleetPage();
  if (page.fleet.isPending) return <ViewState state="loading" />;
  if (page.fleet.isError)
    return <ViewState onRetry={() => void page.fleet.refetch()} state="error" />;
  return (
    <section className="grid gap-5">
      <FleetPageHeader
        onAdd={() => page.dialogs.setFormOpen(true)}
        onCalendar={() => page.dialogs.setCalendarOpen(true)}
      />
      <FleetFilterBar filters={page.filters} update={page.update} />
      <FleetDialogs dialogs={page.dialogs} typeCode={page.filters.typeCode} />
      {page.fleet.data.items.length ? (
        <VehicleList
          onAcquisition={page.dialogs.setAcquisitionTarget}
          vehicles={page.fleet.data.items}
        />
      ) : (
        <ViewState state="empty" />
      )}
    </section>
  );
}
