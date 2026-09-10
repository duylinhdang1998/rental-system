import { useTranslation } from 'react-i18next';
import { TableBody } from '@/components/ui/table-body';
import { TableHead } from '@/components/ui/table-head';
import { TableHeader } from '@/components/ui/table-header';
import { Table } from '@/components/ui/table-root';
import { TableRow } from '@/components/ui/table-row';
import { ReportMoneyRow } from '@/features/reporting/components/tables/ReportMoneyRow';
import type { MoneyRowData } from '@/features/reporting/lib/report-presentation';

interface ReportMoneyTableProps {
  id: string;
  labelKey: string;
  max?: number;
  rows: MoneyRowData[];
  titleKey: string;
}

const FIGURE_KEYS = [
  'reportPayments',
  'reportCash',
  'reportTransfer',
  'reportRefunds',
  'reportNet',
];

/** Table fallback for the chart: the bar under each net figure is the only visual. */
export function ReportMoneyTable({ id, labelKey, max, rows, titleKey }: ReportMoneyTableProps) {
  const { t } = useTranslation();
  return (
    <section className="surface-card overflow-hidden" data-mobile-card data-report-section={id}>
      <h2 className="p-4 text-lg font-extrabold text-ink">{t(titleKey)}</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-panel-subtle text-sm text-ink-muted">
            <TableRow>
              <TableHead>{t(labelKey)}</TableHead>
              {FIGURE_KEYS.map((key) => (
                <TableHead key={key}>{t(key)}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <ReportMoneyRow key={row.key} max={max} row={row} />
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
