import type { FleetEconomicsTotals } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { TableCell } from '@/components/ui/table-cell';
import { TableRow } from '@/components/ui/table-row';
import { formatCurrency, resolveInitialLocale } from '@/shared/i18n/locale';

interface EconomicsUnallocatedRowProps {
  totals: FleetEconomicsTotals;
}

/** Delivery fees, contract-level charges and vehicle-less expenses: counted, never attributed. */
export function EconomicsUnallocatedRow({ totals }: EconomicsUnallocatedRowProps) {
  const { i18n, t } = useTranslation();
  const money = (value: number) => formatCurrency(value, resolveInitialLocale(i18n.language));
  return (
    <TableRow className="text-ink-muted" data-economics-row="unallocated">
      <TableCell className="font-bold" title={t('economicsUnallocatedHelp')}>
        {t('economicsUnallocated')}
      </TableCell>
      <TableCell colSpan={3} />
      <TableCell className="whitespace-nowrap">{money(totals.unallocatedRevenueVnd)}</TableCell>
      <TableCell />
      <TableCell className="whitespace-nowrap">{money(totals.unallocatedExpensesVnd)}</TableCell>
      <TableCell className="whitespace-nowrap font-bold">
        {money(totals.unallocatedRevenueVnd - totals.unallocatedExpensesVnd)}
      </TableCell>
      <TableCell colSpan={2} />
    </TableRow>
  );
}
