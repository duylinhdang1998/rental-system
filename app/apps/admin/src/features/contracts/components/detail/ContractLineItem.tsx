import type { ContractLine } from '@rental/contracts';
import { ContractLineNotes } from '@/features/contracts/components/detail/ContractLineNotes';
import { ContractLineReturn } from '@/features/contracts/components/detail/ContractLineReturn';
import { ContractLineSummary } from '@/features/contracts/components/detail/ContractLineSummary';

interface ContractLineItemProps {
  line: ContractLine;
  onReturn?: ((line: ContractLine) => void) | undefined;
  replacedCode?: string | undefined;
  replacesCode?: string | undefined;
}

type LineStatus = 'active' | 'replaced' | 'returned';

function lineStatus(line: ContractLine): LineStatus {
  if (line.replacedByLineId !== null) return 'replaced';
  return line.inspection ? 'returned' : 'active';
}

export function ContractLineItem({
  line,
  onReturn,
  replacedCode,
  replacesCode,
}: ContractLineItemProps) {
  const status = lineStatus(line);
  const replaced = status === 'replaced';
  return (
    <li
      className={`rounded-card border border-line p-4 ${replaced ? 'bg-panel-subtle text-ink-muted' : ''}`}
      data-line-status={status}
    >
      <ContractLineSummary line={line} replaced={replaced} />
      <ContractLineNotes
        overrideReason={line.overrideReason}
        replacedCode={replacedCode}
        replacesCode={replacesCode}
      />
      <ContractLineReturn
        inspection={line.inspection}
        onReturn={onReturn && status === 'active' ? () => onReturn(line) : undefined}
      />
    </li>
  );
}
