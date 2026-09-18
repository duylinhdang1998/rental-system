import type { PnlReport } from '@rental/contracts';
import { PnlCard } from '@/features/reporting/components/pnl/PnlCard';

interface PnlCardListProps {
  report: PnlReport;
}

export function PnlCardList({ report }: PnlCardListProps) {
  return (
    <ul className="grid gap-3 sm:hidden">
      {report.months.map((row) => (
        <PnlCard key={row.month} row={row} />
      ))}
    </ul>
  );
}
