import type { FleetEconomicsReport } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { TableBody } from '@/components/ui/table-body';
import { TableHead } from '@/components/ui/table-head';
import { TableHeader } from '@/components/ui/table-header';
import { Table } from '@/components/ui/table-root';
import { TableRow } from '@/components/ui/table-row';
import { EconomicsFooterRows } from '@/features/reporting/components/economics/EconomicsFooterRows';
import { EconomicsRow } from '@/features/reporting/components/economics/EconomicsRow';
import {
  ECONOMICS_COLUMN_KEYS,
  sortedEconomicsRows,
} from '@/features/reporting/lib/economics-presentation';

interface EconomicsTableProps {
  report: FleetEconomicsReport;
}

export function EconomicsTable({ report }: EconomicsTableProps) {
  const { t } = useTranslation();
  return (
    <div className="surface-card hidden overflow-x-auto sm:block" data-economics-table>
      <Table>
        <TableHeader className="bg-panel-subtle text-sm text-ink-muted">
          <TableRow>
            {ECONOMICS_COLUMN_KEYS.map((key) => (
              <TableHead key={key}>{t(`economicsColumns.${key}`)}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedEconomicsRows(report.rows).map((row) => (
            <EconomicsRow key={row.vehicleId} row={row} />
          ))}
          <EconomicsFooterRows totals={report.totals} />
        </TableBody>
      </Table>
    </div>
  );
}
