import { useTranslation } from 'react-i18next';
import {
  formatVariance,
  varianceTone,
  type VarianceTone,
} from '@/features/cash-shifts/lib/cash-shift-presentation';
import { resolveInitialLocale } from '@/shared/i18n/locale';

interface CloseShiftVariancePreviewProps {
  varianceVnd: number;
}

const TONE_TEXT_CLASSES: Record<VarianceTone, string> = {
  caution: 'text-caution',
  danger: 'text-negative',
  success: 'text-positive',
};

export function CloseShiftVariancePreview({ varianceVnd }: CloseShiftVariancePreviewProps) {
  const { i18n, t } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  const tone = varianceTone(varianceVnd);
  return (
    <p className={`text-sm font-bold ${TONE_TEXT_CLASSES[tone]}`} data-cash-shift-variance>
      {t('cashShiftVariance')} {formatVariance(varianceVnd, locale)}
    </p>
  );
}
