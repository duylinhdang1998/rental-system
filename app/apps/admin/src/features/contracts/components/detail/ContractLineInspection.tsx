import type { VehicleInspection } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDateTime, resolveInitialLocale } from '@/shared/i18n/locale';

interface ContractLineInspectionProps {
  inspection: VehicleInspection;
}

export function ContractLineInspection({ inspection }: ContractLineInspectionProps) {
  const { i18n, t } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  return (
    <div
      className="mt-3 grid gap-1 rounded-control bg-positive-soft p-3 text-sm"
      data-line-inspection
    >
      <p className="font-bold text-positive">
        {t('lineReturned')} · {formatDateTime(inspection.actualReturnAt, locale)}
      </p>
      <p className="text-ink">
        {t(`returnConditionOption.${inspection.condition}`)} · {t('returnFuel')}:{' '}
        {inspection.fuelPercent}%
      </p>
      {inspection.lateFeeVnd > 0 ? (
        <p className="font-semibold text-negative">
          {t('returnLateFee')}: {formatCurrency(inspection.lateFeeVnd, locale)}
        </p>
      ) : null}
      {inspection.notes ? <p className="text-ink-muted">{inspection.notes}</p> : null}
    </div>
  );
}
