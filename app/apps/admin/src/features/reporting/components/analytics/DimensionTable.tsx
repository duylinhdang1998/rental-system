import type { DimensionRow } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { TableBody } from '@/components/ui/table-body';
import { TableHead } from '@/components/ui/table-head';
import { TableHeader } from '@/components/ui/table-header';
import { Table } from '@/components/ui/table-root';
import { TableRow } from '@/components/ui/table-row';
import { DimensionRowItem } from '@/features/reporting/components/analytics/DimensionRowItem';

type Dimension = 'nationality' | 'type' | 'vehicle';

interface DimensionTableProps {
  dimension: Dimension;
  rows: readonly DimensionRow[];
}

const COLUMNS = ['revenue', 'rentalDays', 'contracts', 'share'] as const;

/** One card per dimension; every table sums to the same total revenue (BR-04). */
export function DimensionTable({ dimension, rows }: DimensionTableProps) {
  const { t } = useTranslation();
  return (
    <section className="surface-card overflow-x-auto" data-dimension-table={dimension}>
      <h2 className="px-4 pt-4 text-lg font-extrabold text-ink">
        {t(`analyticsSections.${dimension}`)}
      </h2>
      <Table>
        <TableHeader className="bg-panel-subtle text-sm text-ink-muted">
          <TableRow>
            <TableHead>{t(`analyticsSections.${dimension}`)}</TableHead>
            {COLUMNS.map((key) => (
              <TableHead key={key}>{t(`dimensionColumns.${key}`)}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <DimensionRowItem key={row.key} row={row} />
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
