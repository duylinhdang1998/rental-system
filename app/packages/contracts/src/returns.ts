import { z } from 'zod';

const MAX_VND = 1_000_000_000;
const MAX_PERCENT = 100;
const MAX_NOTES = 1000;
const MIN_DESCRIPTION = 3;
const MAX_DESCRIPTION = 240;
const MIN_OBJECT_KEY = 3;
const MAX_OBJECT_KEY = 500;
const MAX_IMAGES = 10;
const MAX_INSPECTION_CHARGES = 5;
const BYTES_PER_KIB = 1024;
const MAX_PHOTO_KIB = 2048;
const MAX_PHOTO_FILES = 5;
const MAX_PHOTO_EXPIRY_SECONDS = 3600;
const vndSchema = z.number().int().min(0).max(MAX_VND);
const positiveVndSchema = z.number().int().min(1).max(MAX_VND);

export const returnConditionSchema = z.enum(['GOOD', 'MAINTENANCE', 'DAMAGED']);
export const chargeKindSchema = z.enum(['LATE_RETURN', 'DAMAGE', 'OTHER', 'DISCOUNT']);
export const manualChargeKindSchema = z.enum(['DAMAGE', 'OTHER', 'DISCOUNT']);
export const inspectionChargeKindSchema = z.enum(['DAMAGE', 'OTHER']);
export const settlementItemKindSchema = z.enum([
  'RENTAL',
  'DELIVERY_FEE',
  'LATE_RETURN',
  'DAMAGE',
  'OTHER',
  'DISCOUNT',
]);

export const vehicleInspectionSchema = z.object({
  actualReturnAt: z.iso.datetime(),
  condition: returnConditionSchema,
  fuelPercent: z.number().int().min(0).max(MAX_PERCENT),
  imageCount: z.number().int().min(0),
  lateFeeVnd: vndSchema,
  notes: z.string(),
  returnedById: z.string(),
});

/** Return photos: JPEG / PNG / WebP by magic bytes, at most 5 files of 2 MB per request. */
export const RETURN_PHOTO_LIMITS = {
  maxBytes: MAX_PHOTO_KIB * BYTES_PER_KIB,
  maxFiles: MAX_PHOTO_FILES,
} as const;
export const RETURN_PHOTO_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export const returnPhotoUploadSchema = z.object({
  objectKeys: z.array(z.string().min(MIN_OBJECT_KEY).max(MAX_OBJECT_KEY)).max(MAX_PHOTO_FILES),
});

export const returnPhotoSchema = z.object({
  expiresInSeconds: z.number().int().min(1).max(MAX_PHOTO_EXPIRY_SECONDS),
  index: z.number().int().min(0),
  url: z.string(),
});

export const returnPhotoListSchema = z.object({ items: z.array(returnPhotoSchema) });

interface PricedChargeFields {
  amountVnd?: number;
  damageItemId?: string;
  description?: string;
  kind: string;
}

/** US-026: a catalog item (price and name copied by the API) or a free-text amount and reason. */
const pricedChargeFields = {
  amountVnd: positiveVndSchema.optional(),
  damageItemId: z.string().min(1).optional(),
  description: z.string().trim().min(MIN_DESCRIPTION).max(MAX_DESCRIPTION).optional(),
};

function hasPrice(value: PricedChargeFields): boolean {
  if (value.damageItemId !== undefined) return value.kind === 'DAMAGE';
  return value.amountVnd !== undefined && value.description !== undefined;
}

const PRICE_MESSAGE = 'Chọn hạng mục hư hỏng hoặc nhập số tiền và nội dung';

export const inspectionChargeInputSchema = z
  .object({ ...pricedChargeFields, kind: inspectionChargeKindSchema })
  .strict()
  .refine(hasPrice, { message: PRICE_MESSAGE });

export const contractReturnInputSchema = z
  .object({
    actualReturnAt: z.iso.datetime().optional(),
    charges: z.array(inspectionChargeInputSchema).max(MAX_INSPECTION_CHARGES).default([]),
    condition: returnConditionSchema,
    fuelPercent: z.number().int().min(0).max(MAX_PERCENT),
    imageObjectKeys: z
      .array(z.string().min(MIN_OBJECT_KEY).max(MAX_OBJECT_KEY))
      .max(MAX_IMAGES)
      .default([]),
    notes: z.string().trim().max(MAX_NOTES).default(''),
  })
  .strict();

export const contractChargeInputSchema = z
  .object({
    ...pricedChargeFields,
    kind: manualChargeKindSchema,
    lineId: z.string().min(1).optional(),
  })
  .strict()
  .refine(hasPrice, { message: PRICE_MESSAGE });

export const contractChargeSchema = z.object({
  actorId: z.string(),
  amountVnd: vndSchema,
  createdAt: z.iso.datetime(),
  description: z.string(),
  id: z.string(),
  kind: chargeKindSchema,
  lineId: z.string().nullable(),
  vehicleCode: z.string().nullable(),
});

export const settlementFiguresSchema = z.object({
  chargesVnd: vndSchema,
  depositAppliedVnd: vndSchema,
  depositVnd: vndSchema,
  discountsVnd: vndSchema,
  outstandingVnd: vndSchema,
  paidVnd: vndSchema,
  receivableVnd: vndSchema,
  refundVnd: vndSchema,
  totalDueVnd: vndSchema,
});

export const settlementItemSchema = z.object({
  amountVnd: vndSchema,
  description: z.string(),
  id: z.string(),
  kind: settlementItemKindSchema,
  vehicleCode: z.string().nullable(),
});

export const settlementStatementSchema = settlementFiguresSchema.extend({
  contractId: z.string(),
  items: z.array(settlementItemSchema),
  openVehicleCodes: z.array(z.string()),
  ready: z.boolean(),
  settledAt: z.iso.datetime().nullable(),
});

export const contractSettleInputSchema = z
  .object({
    depositAppliedVnd: vndSchema.optional(),
    documentReturned: z.boolean().default(false),
    notes: z.string().trim().max(MAX_NOTES).default(''),
  })
  .strict();

export const contractSettlementSchema = settlementFiguresSchema.extend({
  depositRefunded: z.boolean(),
  documentReturned: z.boolean(),
  id: z.string(),
  notes: z.string(),
  settledAt: z.iso.datetime(),
  settledById: z.string(),
});

export type ReturnCondition = z.infer<typeof returnConditionSchema>;
export type ChargeKind = z.infer<typeof chargeKindSchema>;
export type ManualChargeKind = z.infer<typeof manualChargeKindSchema>;
export type InspectionChargeKind = z.infer<typeof inspectionChargeKindSchema>;
export type SettlementItemKind = z.infer<typeof settlementItemKindSchema>;
export type VehicleInspection = z.infer<typeof vehicleInspectionSchema>;
export type InspectionChargeInput = z.infer<typeof inspectionChargeInputSchema>;
export type ContractReturnInput = z.infer<typeof contractReturnInputSchema>;
export type ContractChargeInput = z.infer<typeof contractChargeInputSchema>;
export type ContractCharge = z.infer<typeof contractChargeSchema>;
export type SettlementFigures = z.infer<typeof settlementFiguresSchema>;
export type SettlementItem = z.infer<typeof settlementItemSchema>;
export type SettlementStatement = z.infer<typeof settlementStatementSchema>;
export type ContractSettleInput = z.infer<typeof contractSettleInputSchema>;
export type ContractSettlement = z.infer<typeof contractSettlementSchema>;
export type ReturnPhotoUpload = z.infer<typeof returnPhotoUploadSchema>;
export type ReturnPhoto = z.infer<typeof returnPhotoSchema>;
export type ReturnPhotoList = z.infer<typeof returnPhotoListSchema>;
