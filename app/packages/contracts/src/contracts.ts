import { z } from 'zod';
import { contractPaymentSchema } from './payments.js';
import { quoteInputSchema, quoteLineSchema, quoteSchema } from './pricing.js';
import {
  contractChargeSchema,
  contractSettlementSchema,
  vehicleInspectionSchema,
} from './returns.js';

const MAX_VND = 1_000_000_000;
const MAX_PLACE = 240;
const MAX_PERCENT = 100;
const MIN_OBJECT_KEY = 3;
const MAX_OBJECT_KEY = 500;
const MAX_IMAGES = 10;
const MAX_NOTES = 1000;
const MAX_DOCUMENT = 120;
const MAX_VEHICLES = 20;
const MIN_REASON = 3;
const MAX_REASON = 240;
const vndSchema = z.number().int().min(0).max(MAX_VND);

export const contractStatusSchema = z.enum([
  'CONFIRMED',
  'ACTIVE',
  'OVERDUE',
  'COMPLETED',
  'CANCELLED',
]);

export const contractEventTypeSchema = z.enum([
  'CREATED',
  'ACTIVATED',
  'EXTENDED',
  'SWAPPED',
  'OVERDUE',
  'CANCELLED',
  'COMPLETED',
  'LINE_RETURNED',
  'CHARGE_ADDED',
  'SETTLED',
  'PAYMENT_RECORDED',
  'REFUND_RECORDED',
  'DEPOSIT_REFUNDED',
]);

export const contractEventMetadataSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean(), z.null()]),
);

export const contractEventSchema = z.object({
  actorId: z.string(),
  id: z.string(),
  metadata: contractEventMetadataSchema,
  occurredAt: z.iso.datetime(),
  reason: z.string().nullable(),
  type: contractEventTypeSchema,
});

export const contractLineSchema = quoteLineSchema.extend({
  endAt: z.iso.datetime(),
  id: z.string(),
  inspection: vehicleInspectionSchema.nullable(),
  replacedByLineId: z.string().nullable(),
  replacesLineId: z.string().nullable(),
  startAt: z.iso.datetime(),
});

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
  activatedAt: z.iso.datetime().nullable(),
  cancellationReason: z.string().nullable(),
  cancelledAt: z.iso.datetime().nullable(),
  cancelledById: z.string().nullable(),
  charges: z.array(contractChargeSchema),
  code: z.string(),
  completedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  customerId: z.string(),
  events: z.array(contractEventSchema),
  handover: handoverInputSchema.omit({ imageObjectKeys: true }).extend({ imageCount: z.number() }),
  id: z.string(),
  overdueSince: z.iso.datetime().nullable(),
  payments: z.array(contractPaymentSchema),
  quote: quoteSchema.extend({ lines: z.array(contractLineSchema) }),
  settledAt: z.iso.datetime().nullable(),
  settlement: contractSettlementSchema.nullable(),
  status: contractStatusSchema,
});

export const contractSummarySchema = z.object({
  code: z.string(),
  createdAt: z.iso.datetime(),
  customerName: z.string(),
  endAt: z.iso.datetime(),
  id: z.string(),
  settledAt: z.iso.datetime().nullable(),
  startAt: z.iso.datetime(),
  status: contractStatusSchema,
  totalVnd: vndSchema,
  vehicleCodes: z.array(z.string()),
});

export const contractListSchema = z.object({ items: z.array(contractSummarySchema) });

export const contractListQuerySchema = z.object({
  search: z.string().trim().max(MAX_PLACE).optional(),
  status: contractStatusSchema.optional(),
});

export const contractCancelInputSchema = z
  .object({ reason: z.string().trim().min(MIN_REASON).max(MAX_REASON) })
  .strict();

export const contractExtendInputSchema = z
  .object({
    newEndAt: z.iso.datetime(),
    reason: z.string().trim().max(MAX_REASON).optional(),
  })
  .strict();

export const contractSwapInputSchema = z
  .object({
    lineId: z.string().min(1),
    reason: z.string().trim().min(MIN_REASON).max(MAX_REASON),
    replacementVehicleId: z.string().min(1),
  })
  .strict();

export const overdueEvaluationSchema = z.object({
  evaluatedAt: z.iso.datetime(),
  markedContractCodes: z.array(z.string()),
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

export const lateReturnFeeInputSchema = z
  .object({
    actualReturnAt: z.iso.datetime(),
    vehicleId: z.string().min(1),
  })
  .strict();

export const lateReturnFeeResultSchema = z.object({
  actualReturnAt: z.iso.datetime(),
  billableLateHours: z.number().int().min(0),
  feeVnd: vndSchema,
  graceMinutes: z.number().int().min(0),
  hourlyRateVnd: vndSchema,
  lateMinutes: z.number().int().min(0),
  scheduledEndAt: z.iso.datetime(),
  vehicleId: z.string(),
});

export type ContractStatus = z.infer<typeof contractStatusSchema>;
export type ContractEventType = z.infer<typeof contractEventTypeSchema>;
export type ContractEventMetadata = z.infer<typeof contractEventMetadataSchema>;
export type ContractEvent = z.infer<typeof contractEventSchema>;
export type ContractLine = z.infer<typeof contractLineSchema>;
export type ContractCreateInput = z.infer<typeof contractCreateInputSchema>;
export type RentalContract = z.infer<typeof contractSchema>;
export type ContractSummary = z.infer<typeof contractSummarySchema>;
export type ContractListQuery = z.infer<typeof contractListQuerySchema>;
export type ContractCancelInput = z.infer<typeof contractCancelInputSchema>;
export type ContractExtendInput = z.infer<typeof contractExtendInputSchema>;
export type ContractSwapInput = z.infer<typeof contractSwapInputSchema>;
export type OverdueEvaluation = z.infer<typeof overdueEvaluationSchema>;
export type AvailabilityInput = z.infer<typeof availabilityInputSchema>;
export type AvailabilityConflict = z.infer<typeof availabilityConflictSchema>;
export type HandoverInput = z.infer<typeof handoverInputSchema>;
export type LateReturnFeeInput = z.infer<typeof lateReturnFeeInputSchema>;
export type LateReturnFeeResult = z.infer<typeof lateReturnFeeResultSchema>;
