import type { CashShift } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateTime, resolveInitialLocale } from '@/shared/i18n/locale';

interface CurrentShiftSummaryProps {
  onCloseShift: () => void;
  shift: CashShift;
}

export function CurrentShiftSummary({ onCloseShift, shift }: CurrentShiftSummaryProps) {
  const { i18n, t } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-extrabold text-ink">{t('cashShiftCurrent')}</h2>
        <p className="text-sm text-ink-muted">
          {t('cashShiftOpenedBy', {
            name: shift.openedByName,
            time: formatDateTime(shift.openedAt, locale),
          })}
          {' · '}
          {t('cashShiftOpeningFloat')} {formatCurrency(shift.openingFloatVnd, locale)}
        </p>
      </div>
      <Button onClick={onCloseShift} type="button">
        {t('cashShiftClose')}
      </Button>
    </div>
  );
}
