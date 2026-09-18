import type { PnlMonth } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { pnlRowCells } from '@/features/reporting/lib/pnl-presentation';
import { resolveInitialLocale } from '@/shared/i18n/locale';

interface PnlCardProps {
  row: PnlMonth;
}

/** Phone layout: month and profit in the header, the three components underneath. */
export function PnlCard({ row }: PnlCardProps) {
  const { i18n, t } = useTranslation();
  const cells = pnlRowCells(row, resolveInitialLocale(i18n.language));
  const byKey = new Map(cells.map((cell) => [cell.key, cell.value]));
  return (
    <li className="surface-card grid gap-2 p-4" data-mobile-card data-pnl-card={row.month}>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-extrabold text-ink">{byKey.get('month')}</h2>
        <p className="text-lg font-black tabular-nums text-ink">{byKey.get('profit')}</p>
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
        {cells
          .filter((cell) => cell.key !== 'month' && cell.key !== 'profit')
          .map((cell) => (
            <div className="contents" key={cell.key}>
              <dt className="text-ink-muted">{t(`pnlColumns.${cell.key}`)}</dt>
              <dd className="text-right font-bold tabular-nums text-ink">{cell.value}</dd>
            </div>
          ))}
      </dl>
    </li>
  );
}
