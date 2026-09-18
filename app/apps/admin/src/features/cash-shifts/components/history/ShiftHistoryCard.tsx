import type { CashShift } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { VarianceBadge } from '@/features/cash-shifts/components/history/VarianceBadge';
import { formatCurrency, formatDateTime, resolveInitialLocale } from '@/shared/i18n/locale';

interface ShiftHistoryCardProps {
  shift: CashShift;
}

export function ShiftHistoryCard({ shift }: ShiftHistoryCardProps) {
  const { i18n, t } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  return (
    <li className="surface-card grid gap-2 p-4" data-cash-shift-row={shift.id} data-mobile-card>
      <p className="text-xs font-bold text-ink-muted">
        {formatDateTime(shift.openedAt, locale)} · {shift.openedByName}
      </p>
      <p className="text-sm text-ink-muted">
        {t('cashShiftColumns.expected')} {formatCurrency(shift.expectedCashVnd ?? 0, locale)}
        {' · '}
        {t('cashShiftColumns.counted')} {formatCurrency(shift.countedCashVnd ?? 0, locale)}
      </p>
      {shift.varianceVnd === null ? null : <VarianceBadge varianceVnd={shift.varianceVnd} />}
    </li>
  );
}
