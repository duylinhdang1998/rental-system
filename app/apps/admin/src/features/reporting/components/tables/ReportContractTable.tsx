import type { ReportContractRow } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { TableBody } from '@/components/ui/table-body';
import { TableHead } from '@/components/ui/table-head';
import { TableHeader } from '@/components/ui/table-header';
import { Table } from '@/components/ui/table-root';
import { TableRow } from '@/components/ui/table-row';
import { ReportContractLine } from '@/features/reporting/components/tables/ReportContractLine';
import { REPORT_COLUMN_KEYS } from '@/features/reporting/lib/report-presentation';

interface ReportContractTableProps {
  rows: ReportContractRow[];
}

/** The 14 approved columns in the client's order; the Excel export uses the same cells. */
export function ReportContractTable({ rows }: ReportContractTableProps) {
  const { t } = useTranslation();
  return (
    <section className="surface-card overflow-hidden" data-report-rows>
      <h2 className="p-4 text-lg font-extrabold text-ink">{t('reportRows')}</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-panel-subtle text-sm text-ink-muted">
            <TableRow>
              {REPORT_COLUMN_KEYS.map((key) => (
                <TableHead className="whitespace-nowrap" key={key}>
                  {t(`reportColumns.${key}`)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <ReportContractLine key={row.contractId} row={row} />
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
