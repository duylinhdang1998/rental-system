import type { Quote } from '@rental/contracts';
import { ConfirmationForm } from './ConfirmationForm';
import { ContractSuccess } from '../success/ContractSuccess';

interface Props {
  busy: boolean;
  code?: string;
  confirmed: boolean;
  createdAt?: string;
  contractId?: string;
  onBack: () => void;
  onConfirm: (value: boolean) => void;
  onSubmit: () => void;
  quote?: Quote;
}

export function ConfirmationStep(props: Props) {
  return props.contractId ? (
    <ContractSuccess code={props.code} contractId={props.contractId} createdAt={props.createdAt} />
  ) : (
    <ConfirmationForm {...props} />
  );
}
