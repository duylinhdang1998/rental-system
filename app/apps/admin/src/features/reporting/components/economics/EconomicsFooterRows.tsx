import type { FleetEconomicsTotals } from '@rental/contracts';
import { EconomicsTotalRow } from '@/features/reporting/components/economics/EconomicsTotalRow';
import { EconomicsUnallocatedRow } from '@/features/reporting/components/economics/EconomicsUnallocatedRow';

interface EconomicsFooterRowsProps {
  totals: FleetEconomicsTotals;
}

/** "Chưa phân bổ" then "Tổng": the same two closing rows the workbook carries. */
export function EconomicsFooterRows({ totals }: EconomicsFooterRowsProps) {
  return (
    <>
      <EconomicsUnallocatedRow totals={totals} />
      <EconomicsTotalRow totals={totals} />
    </>
  );
}
