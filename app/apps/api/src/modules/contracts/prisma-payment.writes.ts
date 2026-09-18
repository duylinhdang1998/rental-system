import type { Prisma } from '@prisma/client';
import { CONTRACT_INCLUDE, eventData } from './prisma-contract.mapper.js';
import type { LifecycleEventInput, PaymentDraft } from './contract.types.js';

function paymentData(draft: PaymentDraft) {
  return {
    amountVnd: draft.amountVnd,
    id: draft.idempotencyKey,
    idempotencyKey: draft.idempotencyKey,
    kind: draft.kind,
    method: draft.method,
    notes: draft.notes,
    receivedAt: new Date(draft.receivedAt),
    receivedById: draft.receivedById,
    reference: draft.reference,
  };
}

/** US-028: the deposit-refund row, its event and the settlement flag in one transaction. */
export function writeDepositRefund(
  transaction: Prisma.TransactionClient,
  id: string,
  draft: PaymentDraft,
  event: LifecycleEventInput,
) {
  return transaction.contract.update({
    data: {
      events: { create: eventData(event) },
      payments: { create: paymentData(draft) },
      settlement: { update: { depositRefunded: true } },
    },
    include: CONTRACT_INCLUDE,
    where: { id },
  });
}

/** Ledger row and contract event in one transaction; the row id is the idempotency key. */
export function writePayment(
  transaction: Prisma.TransactionClient,
  id: string,
  draft: PaymentDraft,
  event: LifecycleEventInput,
) {
  return transaction.contract.update({
    data: {
      events: { create: eventData(event) },
      payments: { create: paymentData(draft) },
    },
    include: CONTRACT_INCLUDE,
    where: { id },
  });
}
