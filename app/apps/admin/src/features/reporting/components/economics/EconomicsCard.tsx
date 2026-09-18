import type { FleetEconomicsRow } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { Progress } from '@/components/ui/progress';
import { BreakEvenBadge } from '@/features/reporting/components/economics/BreakEvenBadge';
import { economicsCardCells } from '@/features/reporting/lib/economics-presentation';
import { resolveInitialLocale } from '@/shared/i18n/locale';

interface EconomicsCardProps {
  row: FleetEconomicsRow;
}

const PERCENT = 100;

export function EconomicsCard({ row }: EconomicsCardProps) {
  const { i18n, t } = useTranslation();
  const cells = economicsCardCells(row, resolveInitialLocale(i18n.language));
  return (
    <li className="surface-card grid gap-3 p-4" data-economics-card={row.code} data-mobile-card>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-ink-muted">{row.code}</p>
          <h2 className="text-lg font-extrabold text-ink">{row.plate}</h2>
        </div>
        <BreakEvenBadge breakEven={row.breakEven} />
      </div>
      {row.acquisition ? (
        <Progress
          aria-label={t('economicsRecoveredShare', { percent: row.recoveredPercent })}
          max={PERCENT}
          value={row.recoveredPercent}
        />
      ) : null}
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
        {cells.map((cell) => (
          <div className="contents" key={cell.key}>
            <dt className="text-ink-muted">{t(`economicsColumns.${cell.key}`)}</dt>
            <dd className="text-right font-bold tabular-nums text-ink">{cell.value}</dd>
          </div>
        ))}
      </dl>
    </li>
  );
}
