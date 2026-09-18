import type { PnlReport } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { TableCell } from '@/components/ui/table-cell';
import { TableRow } from '@/components/ui/table-row';
import {
  pnlRowCells,
  pnlTotalCells,
  type PnlCell,
} from '@/features/reporting/lib/pnl-presentation';
import { resolveInitialLocale } from '@/shared/i18n/locale';

interface PnlTableRowsProps {
  report: PnlReport;
}

function cellClass(cell: PnlCell): string {
  if (cell.key === 'month') return 'whitespace-nowrap font-black text-ink';
  return cell.key === 'profit'
    ? 'whitespace-nowrap font-black tabular-nums text-ink'
    : 'whitespace-nowrap tabular-nums';
}

export function PnlTableRows({ report }: PnlTableRowsProps) {
  const { i18n, t } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  const rows = [
    ...report.months.map((row) => ({ cells: pnlRowCells(row, locale), key: row.month })),
    { cells: pnlTotalCells(report.totals, locale, t('pnlTotal')), key: 'total' },
  ];
  return (
    <>
      {rows.map((row) => (
        <TableRow
          className={row.key === 'total' ? 'bg-panel-subtle' : undefined}
          data-pnl-row={row.key}
          key={row.key}
        >
          {row.cells.map((cell) => (
            <TableCell className={cellClass(cell)} key={cell.key}>
              {cell.value}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
