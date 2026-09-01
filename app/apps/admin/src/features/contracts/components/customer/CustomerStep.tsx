import type { CustomerSummary } from '@rental/contracts';
import { CustomerOptions } from '@/features/contracts/components/customer/CustomerOptions';
import { RiskAcknowledgement } from '@/features/contracts/components/pricing/RiskAcknowledgement';
import { WizardActions } from '@/features/contracts/components/layout/WizardActions';

interface Props {
  acknowledged: boolean;
  customers: CustomerSummary[];
  customerId: string;
  onAcknowledge: (value: boolean) => void;
  onChange: (id: string) => void;
  onNext: () => void;
}

export function CustomerStep(props: Props) {
  const selected = props.customers.find((customer) => customer.id === props.customerId);
  return (
    <form
      className="grid gap-4"
      data-step="customer"
      onSubmit={(event) => {
        event.preventDefault();
        props.onNext();
      }}
    >
      <CustomerOptions
        customerId={props.customerId}
        customers={props.customers}
        onChange={props.onChange}
      />
      <RiskAcknowledgement
        acknowledged={props.acknowledged}
        customer={selected}
        onAcknowledge={props.onAcknowledge}
      />
      <WizardActions onBack={() => undefined} showBack={false} />
    </form>
  );
}
