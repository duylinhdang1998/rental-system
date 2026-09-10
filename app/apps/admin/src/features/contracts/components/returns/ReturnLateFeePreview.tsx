import { useTranslation } from 'react-i18next';
import { lateFeePreview, type ReturnTarget } from '@/features/contracts/lib/return-form';
import { formatCurrency, formatDateTime, resolveInitialLocale } from '@/shared/i18n/locale';

interface ReturnLateFeePreviewProps {
  actualLocal: string;
  target: ReturnTarget;
}

/** Same formula as the API, so what staff see is what gets snapshotted. */
export function ReturnLateFeePreview({ actualLocal, target }: ReturnLateFeePreviewProps) {
  const { i18n, t } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  const fee = lateFeePreview(target, actualLocal);
  return (
    <div className="rounded-control bg-panel-subtle p-3 text-sm" data-late-fee-preview>
      <p className="text-ink-muted">
        <strong className="text-ink">{target.vehicleCode}</strong> · {t('returnScheduledAt')}:{' '}
        {formatDateTime(target.endAt, locale)}
      </p>
      {fee && fee.feeVnd > 0 ? (
        <p className="mt-1 font-bold text-negative">
          {t('returnLateFee')}: {formatCurrency(fee.feeVnd, locale)} ·{' '}
          {t('returnLateDetail', { hours: fee.billableLateHours, minutes: fee.lateMinutes })}
        </p>
      ) : (
        <p className="mt-1 font-semibold text-positive">{t('returnOnTime')}</p>
      )}
    </div>
  );
}
