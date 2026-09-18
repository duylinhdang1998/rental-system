import { z } from 'zod';
import { contractStatusSchema } from './contracts.js';
import { contractPaymentSchema } from './payments.js';

const MAX_VND = 1_000_000_000;
const vndSchema = z.number().int().min(0).max(MAX_VND);

/** BR-04: every figure has one direction; nothing here is a signed balance. */
export const paymentBalanceSchema = z.object({
  cashVnd: vndSchema,
  depositRefundedVnd: vndSchema,
  paidVnd: vndSchema,
  refundedVnd: vndSchema,
  remainingVnd: vndSchema,
  totalDueVnd: vndSchema,
  transferVnd: vndSchema,
});

export const ledgerEntrySchema = contractPaymentSchema.extend({
  receivedByName: z.string(),
});

export const contractLedgerSchema = z.object({
  balance: paymentBalanceSchema,
  code: z.string(),
  contractId: z.string(),
  entries: z.array(ledgerEntrySchema),
  paymentAllowed: z.boolean(),
  settledAt: z.iso.datetime().nullable(),
});

export const receivableItemSchema = z.object({
  code: z.string(),
  contractId: z.string(),
  customerName: z.string(),
  daysOutstanding: z.number().int().min(0),
  dueAt: z.iso.datetime(),
  lastPaymentAt: z.iso.datetime().nullable(),
  paidVnd: vndSchema,
  remainingVnd: vndSchema,
  settledAt: z.iso.datetime().nullable(),
  status: contractStatusSchema,
  totalDueVnd: vndSchema,
});

export const receivableListSchema = z.object({
  count: z.number().int().min(0),
  generatedAt: z.iso.datetime(),
  items: z.array(receivableItemSchema),
  overSevenDays: z.number().int().min(0),
  timeZone: z.string(),
  totalRemainingVnd: vndSchema,
});

export type PaymentBalance = z.infer<typeof paymentBalanceSchema>;
export type LedgerEntry = z.infer<typeof ledgerEntrySchema>;
export type ContractLedger = z.infer<typeof contractLedgerSchema>;
export type ReceivableItem = z.infer<typeof receivableItemSchema>;
export type ReceivableList = z.infer<typeof receivableListSchema>;
