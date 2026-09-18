import type { PnlReport } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { TableBody } from '@/components/ui/table-body';
import { TableHead } from '@/components/ui/table-head';
import { TableHeader } from '@/components/ui/table-header';
import { Table } from '@/components/ui/table-root';
import { TableRow } from '@/components/ui/table-row';
import { PnlTableRows } from '@/features/reporting/components/pnl/PnlTableRows';
import { PNL_COLUMN_KEYS } from '@/features/reporting/lib/pnl-presentation';

interface PnlTableProps {
  report: PnlReport;
}

/** Desktop layout; also the accessible fallback of the trend chart above it. */
export function PnlTable({ report }: PnlTableProps) {
  const { t } = useTranslation();
  return (
    <div className="surface-card hidden overflow-x-auto sm:block" data-pnl-table>
      <Table>
        <TableHeader className="bg-panel-subtle text-sm text-ink-muted">
          <TableRow>
            {PNL_COLUMN_KEYS.map((key) => (
              <TableHead key={key}>{t(`pnlColumns.${key}`)}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <PnlTableRows report={report} />
        </TableBody>
      </Table>
    </div>
  );
}
