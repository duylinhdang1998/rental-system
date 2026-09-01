import { z } from 'zod';

const MAX_VND = 1_000_000_000;
const MAX_TIERS = 20;
const MAX_TYPE_CODE = 24;
const MIN_REASON = 3;
const MAX_REASON = 240;
const MAX_VEHICLES = 20;
const MAX_PERCENT = 100;
const vndSchema = z.number().int().min(0).max(MAX_VND);

export const pricingTierSchema = z.object({
  dailyRateVnd: vndSchema,
  maxDays: z.number().int().positive().nullable(),
  minDays: z.number().int().positive(),
});

export const pricingVersionSchema = z.object({
  createdAt: z.iso.datetime(),
  id: z.string(),
  tiers: z.array(pricingTierSchema).min(1),
  typeCode: z.string(),
  version: z.number().int().positive(),
});

export const publishPricingInputSchema = z
  .object({
    tiers: z.array(pricingTierSchema).min(1).max(MAX_TIERS),
    typeCode: z.string().trim().min(2).max(MAX_TYPE_CODE),
  })
  .strict();

export const quoteOverrideSchema = z
  .object({
    amountVnd: vndSchema,
    reason: z.string().trim().min(MIN_REASON).max(MAX_REASON),
    vehicleId: z.string().min(1),
  })
  .strict();

export const quoteInputSchema = z
  .object({
    customerId: z.string().min(1),
    deliveryFeeVnd: vndSchema.default(0),
    endAt: z.iso.datetime(),
    overrides: z.array(quoteOverrideSchema).max(MAX_VEHICLES).default([]),
    startAt: z.iso.datetime(),
    vehicleIds: z.array(z.string().min(1)).min(1).max(MAX_VEHICLES),
  })
  .strict();

export const quoteLineSchema = z.object({
  adjustmentPercent: z.number().int().min(0).max(MAX_PERCENT),
  baseSubtotalVnd: vndSchema,
  billableDays: z.number().int().positive(),
  dailyRateVnd: vndSchema,
  explanation: z.string(),
  finalSubtotalVnd: vndSchema,
  overrideReason: z.string().optional(),
  pricingVersionId: z.string(),
  pricingVersionNumber: z.number().int().positive(),
  vehicleCode: z.string(),
  vehicleId: z.string(),
});

export const quoteSchema = z.object({
  customerName: z.string(),
  deliveryFeeVnd: vndSchema,
  endAt: z.iso.datetime(),
  lines: z.array(quoteLineSchema),
  startAt: z.iso.datetime(),
  totalVnd: vndSchema,
});

export type PricingTier = z.infer<typeof pricingTierSchema>;
export type PricingVersion = z.infer<typeof pricingVersionSchema>;
export type PublishPricingInput = z.infer<typeof publishPricingInputSchema>;
export type QuoteInput = z.infer<typeof quoteInputSchema>;
export type Quote = z.infer<typeof quoteSchema>;
export type QuoteLine = z.infer<typeof quoteLineSchema>;
