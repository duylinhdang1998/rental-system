import type { FleetEconomicsReport } from '@rental/contracts';
import { EconomicsCard } from '@/features/reporting/components/economics/EconomicsCard';
import { sortedEconomicsRows } from '@/features/reporting/lib/economics-presentation';

interface EconomicsCardListProps {
  report: FleetEconomicsReport;
}

/** Phone layout: one card per vehicle with the same figures as the table. */
export function EconomicsCardList({ report }: EconomicsCardListProps) {
  return (
    <ul className="grid gap-3 sm:hidden">
      {sortedEconomicsRows(report.rows).map((row) => (
        <EconomicsCard key={row.vehicleId} row={row} />
      ))}
    </ul>
  );
}
