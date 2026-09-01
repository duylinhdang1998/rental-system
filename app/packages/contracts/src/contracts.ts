import { z } from 'zod';
import { quoteInputSchema, quoteSchema } from './pricing.js';

const MAX_VND = 1_000_000_000;
const MAX_PLACE = 240;
const MAX_PERCENT = 100;
const MIN_OBJECT_KEY = 3;
const MAX_OBJECT_KEY = 500;
const MAX_IMAGES = 10;
const MAX_NOTES = 1000;
const MAX_DOCUMENT = 120;
const MAX_VEHICLES = 20;
const vndSchema = z.number().int().min(0).max(MAX_VND);

export const handoverInputSchema = z
  .object({
    deliveryPlace: z.string().trim().min(2).max(MAX_PLACE),
    depositVnd: vndSchema,
    fuelPercent: z.number().int().min(0).max(MAX_PERCENT),
    imageObjectKeys: z
      .array(z.string().min(MIN_OBJECT_KEY).max(MAX_OBJECT_KEY))
      .max(MAX_IMAGES)
      .default([]),
    notes: z.string().trim().max(MAX_NOTES).default(''),
    retainedDocument: z.string().trim().max(MAX_DOCUMENT).default(''),
  })
  .strict();

export const contractCreateInputSchema = quoteInputSchema
  .extend({
    confirmed: z.literal(true),
    handover: handoverInputSchema,
    idempotencyKey: z.string().uuid(),
  })
  .strict();

export const contractSchema = z.object({
  code: z.string(),
  createdAt: z.iso.datetime(),
  customerId: z.string(),
  handover: handoverInputSchema.omit({ imageObjectKeys: true }).extend({ imageCount: z.number() }),
  id: z.string(),
  quote: quoteSchema,
  status: z.literal('CONFIRMED'),
});

export const availabilityInputSchema = z
  .object({
    endAt: z.iso.datetime(),
    startAt: z.iso.datetime(),
    vehicleIds: z.array(z.string().min(1)).min(1).max(MAX_VEHICLES),
  })
  .strict();

export const availabilityConflictSchema = z.object({
  contractCode: z.string(),
  endAt: z.iso.datetime(),
  startAt: z.iso.datetime(),
  vehicleId: z.string(),
});

export const availabilityResultSchema = z.object({
  available: z.boolean(),
  conflicts: z.array(availabilityConflictSchema),
});

export type ContractCreateInput = z.infer<typeof contractCreateInputSchema>;
export type RentalContract = z.infer<typeof contractSchema>;
export type AvailabilityInput = z.infer<typeof availabilityInputSchema>;
export type AvailabilityConflict = z.infer<typeof availabilityConflictSchema>;
export type HandoverInput = z.infer<typeof handoverInputSchema>;
