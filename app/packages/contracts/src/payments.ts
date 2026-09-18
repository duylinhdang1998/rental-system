import { z } from 'zod';

const MAX_VND = 1_000_000_000;
const MAX_NOTES = 1000;
const MAX_REFERENCE = 120;
const positiveVndSchema = z.number().int().min(1).max(MAX_VND);

/**
 * PAYMENT and REFUND move revenue; DEPOSIT_REFUND hands the customer's own deposit back after
 * settlement and is neither revenue nor a refund of revenue (BR-11).
 */
export const paymentKindSchema = z.enum(['PAYMENT', 'REFUND', 'DEPOSIT_REFUND']);
/** Kinds a person records by hand; the deposit refund has its own one-shot action. */
export const manualPaymentKindSchema = z.enum(['PAYMENT', 'REFUND']);
export const paymentMethodSchema = z.enum(['CASH', 'BANK_TRANSFER']);

export const contractPaymentInputSchema = z
  .object({
    amountVnd: positiveVndSchema,
    idempotencyKey: z.string().uuid(),
    kind: manualPaymentKindSchema.default('PAYMENT'),
    method: paymentMethodSchema,
    notes: z.string().trim().max(MAX_NOTES).default(''),
    receivedAt: z.iso.datetime().optional(),
    reference: z.string().trim().max(MAX_REFERENCE).default(''),
  })
  .strict();

/** US-028: the amount is the frozen settlement refund, so the caller never sends one. */
export const depositRefundInputSchema = z
  .object({
    idempotencyKey: z.string().uuid(),
    method: paymentMethodSchema,
    notes: z.string().trim().max(MAX_NOTES).default(''),
    reference: z.string().trim().max(MAX_REFERENCE).default(''),
  })
  .strict();

/** One immutable ledger row (BR-07): never updated, never deleted. */
export const contractPaymentSchema = z.object({
  amountVnd: positiveVndSchema,
  id: z.string(),
  kind: paymentKindSchema,
  method: paymentMethodSchema,
  notes: z.string(),
  receivedAt: z.iso.datetime(),
  receivedById: z.string(),
  reference: z.string(),
});

export type PaymentKind = z.infer<typeof paymentKindSchema>;
export type ManualPaymentKind = z.infer<typeof manualPaymentKindSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type ContractPaymentInput = z.infer<typeof contractPaymentInputSchema>;
export type DepositRefundInput = z.infer<typeof depositRefundInputSchema>;
export type ContractPayment = z.infer<typeof contractPaymentSchema>;
