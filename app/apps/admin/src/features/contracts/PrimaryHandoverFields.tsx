import type { ContractDraftState } from './contract-draft';
import { HandoverDeliveryFields } from './HandoverDeliveryFields';
import { HandoverFinancialFields } from './HandoverFinancialFields';

interface Props {
  draft: ContractDraftState;
  onChange: (field: keyof ContractDraftState, value: string | number | boolean | string[]) => void;
}

export function PrimaryHandoverFields({ draft, onChange }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <HandoverFinancialFields draft={draft} onChange={onChange} />
      <HandoverDeliveryFields draft={draft} onChange={onChange} />
    </div>
  );
}
