import type { CashShiftExpectation } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { movementRows } from '@/features/cash-shifts/lib/cash-shift-presentation';
import { resolveInitialLocale } from '@/shared/i18n/locale';

interface MovementChipsProps {
  expectation: CashShiftExpectation;
}

export function MovementChips({ expectation }: MovementChipsProps) {
  const { i18n, t } = useTranslation();
  const rows = movementRows(expectation, resolveInitialLocale(i18n.language));
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {rows.map((row) => (
        <li
          className="rounded-control bg-panel-subtle px-3 py-2 text-sm font-semibold text-ink"
          key={row.labelKey}
        >
          <p className="text-xs font-bold text-ink-muted">{t(row.labelKey)}</p>
          {row.signed}
          {row.value}
        </li>
      ))}
    </ul>
  );
}
