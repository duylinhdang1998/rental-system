import type { VehicleStatus } from '@rental/contracts';
import { FleetSearchField } from '@/features/fleet/components/filters/FleetSearchField';
import { FleetStatusFilter } from '@/features/fleet/components/filters/FleetStatusFilter';
import { FleetTypeFilter } from '@/features/fleet/components/filters/FleetTypeFilter';

interface FleetFilterBarProps {
  filters: { search?: string; status?: VehicleStatus; typeCode?: string };
  update: (key: string, value: string) => void;
}

export function FleetFilterBar({ filters, update }: FleetFilterBarProps) {
  return (
    <div className="surface-card grid gap-3 p-4 sm:grid-cols-3">
      <FleetSearchField
        onChange={(value) => update('search', value)}
        value={filters.search ?? ''}
      />
      <FleetStatusFilter
        onChange={(value) => update('status', value)}
        value={filters.status ?? ''}
      />
      <FleetTypeFilter
        onChange={(value) => update('typeCode', value)}
        value={filters.typeCode ?? ''}
      />
    </div>
  );
}
