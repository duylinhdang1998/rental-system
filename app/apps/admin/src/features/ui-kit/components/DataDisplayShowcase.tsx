import { KpiSpecimen } from '@/features/ui-kit/components/KpiSpecimen';
import { StatusSpecimen } from '@/features/ui-kit/components/StatusSpecimen';
import { TableSpecimen } from '@/features/ui-kit/components/TableSpecimen';

export function DataDisplayShowcase() {
  return (
    <div className="grid gap-7">
      <StatusSpecimen />
      <KpiSpecimen />
      <TableSpecimen />
    </div>
  );
}
