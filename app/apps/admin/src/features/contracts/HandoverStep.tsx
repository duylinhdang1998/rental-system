import { WizardActions } from './WizardActions';
import type { ContractDraftState } from './contract-draft';
import { OptionalHandoverFields } from './OptionalHandoverFields';
import { PrimaryHandoverFields } from './PrimaryHandoverFields';

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
