import type { CashShiftExpectation } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { formatCurrency, resolveInitialLocale } from '@/shared/i18n/locale';

interface CloseShiftExpectedLineProps {
  expectation: CashShiftExpectation;
}

export function CloseShiftExpectedLine({ expectation }: CloseShiftExpectedLineProps) {
  const { i18n, t } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  return (
    <p className="text-sm font-bold text-ink-muted">
      {t('cashShiftExpected')} {formatCurrency(expectation.expectedCashVnd, locale)}
    </p>
  );
}
