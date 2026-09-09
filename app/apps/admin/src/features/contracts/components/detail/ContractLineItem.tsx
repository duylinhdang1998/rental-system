import type { ContractLine } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { ContractLineNotes } from '@/features/contracts/components/detail/ContractLineNotes';
import { formatCurrency, formatDateTime, resolveInitialLocale } from '@/shared/i18n/locale';

interface ContractLineItemProps {
  line: ContractLine;
  replacedCode?: string;
  replacesCode?: string;
}

export function ContractLineItem({ line, replacedCode, replacesCode }: ContractLineItemProps) {
  const { i18n } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  const replaced = line.replacedByLineId !== null;
  return (
    <li
      className={`rounded-card border border-line p-4 ${replaced ? 'bg-panel-subtle text-ink-muted' : ''}`}
      data-line-status={replaced ? 'replaced' : 'active'}
    >
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
      <ContractLineNotes
        overrideReason={line.overrideReason}
        replacedCode={replacedCode}
        replacesCode={replacesCode}
      />
    </li>
  );
}
