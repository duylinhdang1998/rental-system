import type { FleetEconomicsRow } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { TableCell } from '@/components/ui/table-cell';
import { TableRow } from '@/components/ui/table-row';
import { BreakEvenBadge } from '@/features/reporting/components/economics/BreakEvenBadge';
import { economicsRowCells } from '@/features/reporting/lib/economics-presentation';
import { resolveInitialLocale } from '@/shared/i18n/locale';

interface EconomicsRowProps {
  row: FleetEconomicsRow;
}

export function EconomicsRow({ row }: EconomicsRowProps) {
  const { i18n } = useTranslation();
  const cells = economicsRowCells(row, resolveInitialLocale(i18n.language), '');
  return (
    <TableRow data-economics-row={row.code}>
      {cells.map((cell) => {
        if (cell.key === 'breakEven') {
          return (
            <TableCell key={cell.key}>
              <BreakEvenBadge breakEven={row.breakEven} />
            </TableCell>
          );
        }
        const emphasis = cell.key === 'vehicle' || cell.key === 'net';
        return (
          <TableCell
            className={emphasis ? 'whitespace-nowrap font-black text-ink' : 'whitespace-nowrap'}
            key={cell.key}
          >
            {cell.value}
          </TableCell>
        );
      })}
    </TableRow>
  );
}
