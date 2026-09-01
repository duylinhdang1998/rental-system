import { WizardActions } from '@/features/contracts/components/layout/WizardActions';
import type { ContractDraftState } from '@/features/contracts/lib/contract-draft';
import { OptionalHandoverFields } from '@/features/contracts/components/handover/OptionalHandoverFields';
import { PrimaryHandoverFields } from '@/features/contracts/components/handover/PrimaryHandoverFields';

interface Props {
  draft: ContractDraftState;
  onBack: () => void;
  onChange: (field: keyof ContractDraftState, value: string | number | boolean | string[]) => void;
  onNext: () => void;
}

export function HandoverStep(props: Props) {
  return (
    <form
      className="grid gap-4"
      data-step="handover"
      onSubmit={(event) => {
        event.preventDefault();
        props.onNext();
      }}
    >
      <PrimaryHandoverFields draft={props.draft} onChange={props.onChange} />
      <OptionalHandoverFields draft={props.draft} onChange={props.onChange} />
      <WizardActions onBack={props.onBack} showBack />
    </form>
  );
}
