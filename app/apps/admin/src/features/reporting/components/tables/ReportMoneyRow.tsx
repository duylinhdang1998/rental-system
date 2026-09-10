import { Progress } from '@/components/ui/progress';
import { TableCell } from '@/components/ui/table-cell';
import { TableRow } from '@/components/ui/table-row';
import type { MoneyRowData } from '@/features/reporting/lib/report-presentation';

interface ReportMoneyRowProps {
  max: number | undefined;
  row: MoneyRowData;
}

export function ReportMoneyRow({ max, row }: ReportMoneyRowProps) {
  return (
    <TableRow>
      <TableCell className="whitespace-nowrap font-bold text-ink">{row.label}</TableCell>
      <TableCell>{row.paymentCount}</TableCell>
      <TableCell className="whitespace-nowrap">{row.cash}</TableCell>
      <TableCell className="whitespace-nowrap">{row.transfer}</TableCell>
      <TableCell className="whitespace-nowrap">{row.refund}</TableCell>
      <TableCell className="whitespace-nowrap font-black text-ink">
        {row.net}
        {max ? (
          <Progress aria-label={row.label} className="mt-1 w-full" max={max} value={row.netVnd} />
        ) : null}
      </TableCell>
    </TableRow>
  );
}
