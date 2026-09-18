import type { CashShiftExpectation } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatTime, resolveInitialLocale } from '@/shared/i18n/locale';

interface CurrentShiftFigureProps {
  expectation: CashShiftExpectation;
}

export function CurrentShiftFigure({ expectation }: CurrentShiftFigureProps) {
  const { i18n, t } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  return (
    <div>
      <p className="text-sm font-bold text-ink-muted">{t('cashShiftExpected')}</p>
      <p className="text-3xl font-black text-ink" data-cash-shift-expected>
        {formatCurrency(expectation.expectedCashVnd, locale)}
      </p>
      <p className="mt-1 text-xs text-ink-muted">
        {t('cashShiftUpdatedAt', { time: formatTime(expectation.asOf, locale) })}
      </p>
    </div>
  );
}
