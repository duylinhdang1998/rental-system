import type { CashShift } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { TableCell } from '@/components/ui/table-cell';
import { TableRow } from '@/components/ui/table-row';
import { VarianceBadge } from '@/features/cash-shifts/components/history/VarianceBadge';
import { formatCurrency, formatDateTime, resolveInitialLocale } from '@/shared/i18n/locale';

interface ShiftHistoryTableRowProps {
  shift: CashShift;
}

export function ShiftHistoryTableRow({ shift }: ShiftHistoryTableRowProps) {
  const { i18n } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  const money = (value: number | null) => (value === null ? '—' : formatCurrency(value, locale));
  return (
    <TableRow data-cash-shift-row={shift.id}>
      <TableCell className="whitespace-nowrap">{formatDateTime(shift.openedAt, locale)}</TableCell>
      <TableCell>{shift.openedByName}</TableCell>
      <TableCell className="whitespace-nowrap">
        {shift.closedAt ? formatDateTime(shift.closedAt, locale) : '—'}
      </TableCell>
      <TableCell>{shift.closedByName ?? '—'}</TableCell>
      <TableCell>{money(shift.expectedCashVnd)}</TableCell>
      <TableCell>{money(shift.countedCashVnd)}</TableCell>
      <TableCell>
        {shift.varianceVnd === null ? '—' : <VarianceBadge varianceVnd={shift.varianceVnd} />}
      </TableCell>
      <TableCell>{shift.note || '—'}</TableCell>
    </TableRow>
  );
}
