import type { UseMutationResult } from '@tanstack/react-query';
import type { ContractPaymentInput, RentalContract } from '@rental/contracts';
import { LifecycleFormDialog } from '@/features/contracts/components/lifecycle/LifecycleFormDialog';
import { PaymentAmountFields } from '@/features/contracts/components/payments/PaymentAmountFields';
import { PaymentKindField } from '@/features/contracts/components/payments/PaymentKindField';
import { PaymentMethodFields } from '@/features/contracts/components/payments/PaymentMethodFields';
import { usePaymentForm } from '@/features/contracts/hooks/use-payment-form';
import {
  paymentBlocked,
  paymentCapFor,
  type PaymentCaps,
} from '@/features/contracts/lib/payment-presentation';

interface PaymentDialogProps {
  balance: PaymentCaps;
  mutation: UseMutationResult<RentalContract, Error, ContractPaymentInput>;
  onClose: () => void;
}

const COPY_KEYS = { description: 'paymentBody', save: 'paymentConfirm', title: 'paymentRecord' };

export function PaymentDialog({ balance, mutation, onClose }: PaymentDialogProps) {
  const form = usePaymentForm(mutation, onClose);
  const cap = paymentCapFor(balance, form.form.kind);
  return (
    <LifecycleFormDialog
      copyKeys={COPY_KEYS}
      mutation={mutation}
      onClose={onClose}
      onSubmit={form.submit}
      submitDisabled={paymentBlocked(form.form, cap)}
    >
      <PaymentKindField onChange={(kind) => form.change('kind', kind)} value={form.form.kind} />
      <PaymentAmountFields cap={cap} onChange={form.change} values={form.form} />
      <PaymentMethodFields onChange={form.change} values={form.form} />
    </LifecycleFormDialog>
  );
}
