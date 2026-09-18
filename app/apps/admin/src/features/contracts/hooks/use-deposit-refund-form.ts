import { useState } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import type { DepositRefundInput, RentalContract } from '@rental/contracts';
import { useLifecycleForm } from '@/features/contracts/hooks/use-lifecycle-form';
import {
  INITIAL_DEPOSIT_REFUND_FORM,
  toDepositRefundInput,
  type DepositRefundFormValues,
} from '@/features/contracts/lib/payment-presentation';

/** One idempotency key per open dialog: a retried submit replays instead of refunding twice. */
export function useDepositRefundForm(
  mutation: UseMutationResult<RentalContract, Error, DepositRefundInput>,
  onDone: () => void,
) {
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  return useLifecycleForm<DepositRefundFormValues, DepositRefundInput>(
    INITIAL_DEPOSIT_REFUND_FORM,
    (form) => toDepositRefundInput(form, idempotencyKey),
    mutation,
    onDone,
  );
}
