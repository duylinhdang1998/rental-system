import type { MonthRow } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { TableBody } from '@/components/ui/table-body';
import { TableCell } from '@/components/ui/table-cell';
import { TableHead } from '@/components/ui/table-head';
import { TableHeader } from '@/components/ui/table-header';
import { Table } from '@/components/ui/table-root';
import { TableRow } from '@/components/ui/table-row';
import { monthCells } from '@/features/reporting/lib/analytics-presentation';
import { resolveInitialLocale } from '@/shared/i18n/locale';

interface MonthTableProps {
  rows: readonly MonthRow[];
}

const COLUMNS = ['month', 'revenue', 'rentalDays', 'contracts'] as const;

/** The accessible fallback of the monthly chart: the same figures as a plain table. */
export function MonthTable({ rows }: MonthTableProps) {
  const { i18n, t } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-panel-subtle text-sm text-ink-muted">
          <TableRow>
            {COLUMNS.map((key) => (
              <TableHead key={key}>{t(`monthColumns.${key}`)}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const cells = monthCells(row, locale);
            return (
              <TableRow data-month-row={row.month} key={row.month}>
                <TableCell className="font-black text-ink">{cells.month}</TableCell>
                <TableCell className="whitespace-nowrap tabular-nums">{cells.revenue}</TableCell>
                <TableCell className="tabular-nums">{cells.rentalDays}</TableCell>
                <TableCell className="tabular-nums">{cells.contracts}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
