import type { SettlementFigures } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { figureRows } from '@/features/contracts/lib/settlement-presentation';
import { resolveInitialLocale } from '@/shared/i18n/locale';

interface SettlementFigureListProps {
  figures: SettlementFigures;
}

export function SettlementFigureList({ figures }: SettlementFigureListProps) {
  const { i18n, t } = useTranslation();
  const rows = figureRows(figures, resolveInitialLocale(i18n.language));
  return (
    <dl className="grid gap-2 text-sm" data-settlement-figures>
      {rows.map((row) => (
        <div className="flex items-baseline justify-between gap-3" key={row.labelKey}>
          <dt className={row.emphasis ? 'font-bold text-ink' : 'text-ink-muted'}>
            {t(row.labelKey)}
          </dt>
          <dd className={row.emphasis ? 'text-lg font-black text-ink' : 'font-semibold text-ink'}>
            {row.value}
          </dd>
        </div>
      ))}
      <p className="mt-1 text-xs text-ink-muted">{t('settlementPaidNote')}</p>
    </dl>
  );
}
