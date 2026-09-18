import { useTranslation } from 'react-i18next';
import {
  formatVariance,
  varianceTone,
  type VarianceTone,
} from '@/features/cash-shifts/lib/cash-shift-presentation';
import { resolveInitialLocale } from '@/shared/i18n/locale';
import { StatusBadge } from '@/shared/ui/StatusBadge';

interface VarianceBadgeProps {
  varianceVnd: number;
}

const TONE_LABEL_KEYS: Record<VarianceTone, string> = {
  caution: 'cashShiftOver',
  danger: 'cashShiftShort',
  success: 'cashShiftMatch',
};

const BADGE_TONES: Record<VarianceTone, 'danger' | 'success' | 'warning'> = {
  caution: 'warning',
  danger: 'danger',
  success: 'success',
};

export function VarianceBadge({ varianceVnd }: VarianceBadgeProps) {
  const { i18n, t } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  const tone = varianceTone(varianceVnd);
  return (
    <span className="inline-flex flex-col items-start gap-1" data-cash-shift-variance>
      <StatusBadge label={t(TONE_LABEL_KEYS[tone])} tone={BADGE_TONES[tone]} />
      <span className="text-xs text-ink-muted">{formatVariance(varianceVnd, locale)}</span>
    </span>
  );
}
