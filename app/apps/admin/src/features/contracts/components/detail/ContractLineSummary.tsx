import type { ContractLine } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDateTime, resolveInitialLocale } from '@/shared/i18n/locale';

interface ContractLineSummaryProps {
  line: ContractLine;
  replaced: boolean;
}

export function ContractLineSummary({ line, replaced }: ContractLineSummaryProps) {
  const { i18n } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <strong className={replaced ? 'line-through' : 'text-ink'}>{line.vehicleCode}</strong>
        <strong className={replaced ? '' : 'text-ink'}>
          {formatCurrency(line.finalSubtotalVnd, locale)}
        </strong>
      </div>
      <p className="mt-1 text-sm">
        {formatDateTime(line.startAt, locale)} → {formatDateTime(line.endAt, locale)}
      </p>
      <p className="mt-1 text-sm text-ink-muted">{line.explanation}</p>
    </>
  );
}
