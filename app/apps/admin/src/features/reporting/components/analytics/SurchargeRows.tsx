import type { SurchargeRow } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { TableCell } from '@/components/ui/table-cell';
import { TableRow } from '@/components/ui/table-row';
import { signedCurrency, surchargeCells } from '@/features/reporting/lib/analytics-presentation';
import { resolveInitialLocale } from '@/shared/i18n/locale';

interface SurchargeRowsProps {
  netVnd: number;
  rows: readonly SurchargeRow[];
}

/** Late, damage and other add; discounts subtract; the net row is what the ledger carries. */
export function SurchargeRows({ netVnd, rows }: SurchargeRowsProps) {
  const { i18n, t } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  return (
    <>
      {rows.map((row) => {
        const cells = surchargeCells(row, locale);
        const discount = row.kind === 'DISCOUNT' && row.amountVnd > 0;
        return (
          <TableRow data-surcharge-row={row.kind} key={row.kind}>
            <TableCell className="whitespace-nowrap font-black text-ink">
              {t(`surchargeKind.${row.kind}`)}
            </TableCell>
            <TableCell className="tabular-nums">{cells.count}</TableCell>
            <TableCell className="whitespace-nowrap tabular-nums">
              {discount ? `−${cells.amount}` : cells.amount}
            </TableCell>
          </TableRow>
        );
      })}
      <TableRow className="bg-panel-subtle font-black text-ink" data-surcharge-row="net">
        <TableCell>{t('surchargeNet')}</TableCell>
        <TableCell />
        <TableCell className="whitespace-nowrap tabular-nums">
          {signedCurrency(netVnd, locale)}
        </TableCell>
      </TableRow>
    </>
  );
}
