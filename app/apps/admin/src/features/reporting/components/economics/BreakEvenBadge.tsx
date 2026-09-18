import type { BreakEven } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { breakEvenLabel, breakEvenTone } from '@/features/reporting/lib/economics-presentation';
import { resolveInitialLocale } from '@/shared/i18n/locale';
import { StatusBadge } from '@/shared/ui/StatusBadge';

interface BreakEvenBadgeProps {
  breakEven: BreakEven;
}

export function BreakEvenBadge({ breakEven }: BreakEvenBadgeProps) {
  const { i18n, t } = useTranslation();
  return (
    <StatusBadge
      label={breakEvenLabel(breakEven, resolveInitialLocale(i18n.language), t)}
      tone={breakEvenTone(breakEven.status)}
    />
  );
}
