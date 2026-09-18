import type { FleetEconomicsTotals } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { TableCell } from '@/components/ui/table-cell';
import { TableRow } from '@/components/ui/table-row';
import { formatCurrency, resolveInitialLocale } from '@/shared/i18n/locale';

interface EconomicsTotalRowProps {
  totals: FleetEconomicsTotals;
}

export function EconomicsTotalRow({ totals }: EconomicsTotalRowProps) {
  const { i18n, t } = useTranslation();
  const money = (value: number) => formatCurrency(value, resolveInitialLocale(i18n.language));
  const recovered = t('economicsKpiCount', {
    count: totals.vehicleCount,
    recovered: totals.vehiclesRecovered,
  });
  return (
    <TableRow className="bg-panel-subtle font-black text-ink" data-economics-row="total">
      <TableCell>{t('economicsGrandTotal')}</TableCell>
      <TableCell className="whitespace-nowrap">{money(totals.purchasePriceVnd)}</TableCell>
      <TableCell />
      <TableCell className="whitespace-nowrap">{money(totals.bookValueVnd)}</TableCell>
      <TableCell className="whitespace-nowrap">{money(totals.revenueVnd)}</TableCell>
      <TableCell>{totals.rentalDays}</TableCell>
      <TableCell className="whitespace-nowrap">{money(totals.expensesVnd)}</TableCell>
      <TableCell className="whitespace-nowrap">{money(totals.netVnd)}</TableCell>
      <TableCell className="whitespace-nowrap" colSpan={2}>
        {recovered}
      </TableCell>
    </TableRow>
  );
}
