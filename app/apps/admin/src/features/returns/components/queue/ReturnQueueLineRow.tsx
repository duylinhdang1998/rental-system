import type { ReturnQueueLine } from '@rental/contracts';
import { PackageCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { formatDateTime, resolveInitialLocale } from '@/shared/i18n/locale';

interface ReturnQueueLineRowProps {
  line: ReturnQueueLine;
  onReturn: () => void;
}

export function ReturnQueueLineRow({ line, onReturn }: ReturnQueueLineRowProps) {
  const { i18n, t } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  return (
    <li
      className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line p-3"
      data-queue-line={line.vehicleCode}
    >
      <div>
        <p className="font-bold text-ink">{line.vehicleCode}</p>
        <p className="text-sm text-ink-muted">
          {t('returnQueueDue', { time: formatDateTime(line.endAt, locale) })}
        </p>
        {line.kind === 'OVERDUE' ? (
          <p className="text-sm font-semibold text-negative">
            {t('returnQueueLineKind.OVERDUE', { hours: line.hoursLate })}
          </p>
        ) : null}
      </div>
      <Button onClick={onReturn} size="sm" type="button">
        <PackageCheck aria-hidden data-icon="inline-start" />
        {t('returnVehicle')}
      </Button>
    </li>
  );
}
