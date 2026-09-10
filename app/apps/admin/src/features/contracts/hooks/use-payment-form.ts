import { useState } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import type { ContractPaymentInput, RentalContract } from '@rental/contracts';
import { useLifecycleForm } from '@/features/contracts/hooks/use-lifecycle-form';
import {
  INITIAL_PAYMENT_FORM,
  toPaymentInput,
  type PaymentFormValues,
} from '@/features/contracts/lib/payment-presentation';

/** One idempotency key per open dialog: a retried submit replays instead of double-charging. */
export function usePaymentForm(
  mutation: UseMutationResult<RentalContract, Error, ContractPaymentInput>,
  onDone: () => void,
) {
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  return useLifecycleForm<PaymentFormValues, ContractPaymentInput>(
    INITIAL_PAYMENT_FORM,
    (form) => toPaymentInput(form, idempotencyKey),
    mutation,
    onDone,
  );
}
