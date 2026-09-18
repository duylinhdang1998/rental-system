import type { DimensionRow } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { TableCell } from '@/components/ui/table-cell';
import { TableRow } from '@/components/ui/table-row';
import { ShareCell } from '@/features/reporting/components/analytics/ShareCell';
import { dimensionCells } from '@/features/reporting/lib/analytics-presentation';
import { resolveInitialLocale } from '@/shared/i18n/locale';

interface DimensionRowItemProps {
  row: DimensionRow;
}

export function DimensionRowItem({ row }: DimensionRowItemProps) {
  const { i18n, t } = useTranslation();
  const cells = dimensionCells(row, resolveInitialLocale(i18n.language), t('analyticsUnallocated'));
  return (
    <TableRow data-dimension-row={cells.unallocated ? 'unallocated' : row.label}>
      <TableCell className="whitespace-nowrap font-black text-ink">{cells.label}</TableCell>
      <TableCell className="whitespace-nowrap tabular-nums">{cells.revenue}</TableCell>
      <TableCell className="tabular-nums">{cells.rentalDays}</TableCell>
      <TableCell className="tabular-nums">{cells.contracts}</TableCell>
      <ShareCell label={t('analyticsShare', { percent: cells.share })} percent={cells.share} />
    </TableRow>
  );
}
