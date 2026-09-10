import { useTranslation } from 'react-i18next';
import { receivableTone } from '@/features/finance/lib/receivable-presentation';
import { StatusBadge } from '@/shared/ui/StatusBadge';

interface ReceivableAgeBadgeProps {
  days: number;
}

export function ReceivableAgeBadge({ days }: ReceivableAgeBadgeProps) {
  const { t } = useTranslation();
  return <StatusBadge label={t('receivableDays', { count: days })} tone={receivableTone(days)} />;
}
