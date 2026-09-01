import type { Quote } from '@rental/contracts';
import { ConfirmationForm } from './ConfirmationForm';
import { ContractSuccess } from './ContractSuccess';

interface Props {
  busy: boolean;
  code?: string;
  confirmed: boolean;
  contractId?: string;
  onBack: () => void;
  onConfirm: (value: boolean) => void;
  onSubmit: () => void;
  quote?: Quote;
}

export function ConfirmationStep(props: Props) {
  return props.contractId ? (
    <ContractSuccess code={props.code} contractId={props.contractId} />
  ) : (
    <ConfirmationForm {...props} />
  );
}
