import { z } from 'zod';
import { vehicleStatusSchema } from './fleet.js';
import { paymentMethodSchema } from './payments.js';
import { ISO_DATE_LENGTH } from './time.js';

const MAX_VND = 1_000_000_000_000;
const MAX_EXPENSE_VND = 1_000_000_000;
const MAX_USEFUL_LIFE_MONTHS = 240;
const MIN_DESCRIPTION = 3;
const MAX_DESCRIPTION = 240;
const MAX_NOTES = 1000;
const MAX_REFERENCE = 120;
const MAX_LIST_LIMIT = 500;
const DEFAULT_LIST_LIMIT = 200;
const MONTHS_PER_YEAR = 12;
const PERCENT = 100;

/** Break-even projections extrapolate the trailing 90-day net into 30-day months. */
export const TRAILING_WINDOW_DAYS = 90;
export const DAYS_PER_MONTH = 30;

const vndSchema = z.number().int().min(0).max(MAX_VND);
const signedVndSchema = z.number().int().min(-MAX_VND).max(MAX_VND);
const countSchema = z.number().int().min(0);
const percentSchema = z.number().int().min(0).max(PERCENT);

// ---------------------------------------------------------------------------
// Vehicle acquisition and straight-line depreciation (US-023)
// ---------------------------------------------------------------------------

export const vehicleAcquisitionInputSchema = z
  .object({
    purchasePriceVnd: vndSchema,
    purchasedOn: z.iso.date(),
    salvageValueVnd: vndSchema.default(0),
    usefulLifeMonths: z.number().int().min(1).max(MAX_USEFUL_LIFE_MONTHS),
  })
  .strict()
  .refine((value) => value.salvageValueVnd <= value.purchasePriceVnd, {
    message: 'Giá trị thanh lý không được vượt giá mua',
    path: ['salvageValueVnd'],
  });

export const vehicleAcquisitionSchema = z.object({
  purchasePriceVnd: vndSchema,
  purchasedOn: z.iso.date(),
  salvageValueVnd: vndSchema,
  updatedAt: z.iso.datetime(),
  updatedById: z.string(),
  usefulLifeMonths: z.number().int().min(1).max(MAX_USEFUL_LIFE_MONTHS),
  vehicleId: z.string(),
});

/** GET view: the record or null when the Owner has not priced the vehicle yet. */
export const vehicleAcquisitionViewSchema = z.object({
  acquisition: vehicleAcquisitionSchema.nullable(),
  vehicleId: z.string(),
});

export const depreciationSchema = z.object({
  accumulatedDepreciationVnd: vndSchema,
  bookValueVnd: vndSchema,
  monthlyDepreciationVnd: vndSchema,
  monthsElapsed: countSchema,
});

function dayParts(day: string): { year: number; month: number; dayOfMonth: number } {
  const [year, month, dayOfMonth] = day.slice(0, ISO_DATE_LENGTH).split('-').map(Number);
  return { dayOfMonth: dayOfMonth ?? 1, month: month ?? 1, year: year ?? 0 };
}

/** Whole months from `from` to `to`; the same day-of-month or later counts the month. Never negative. */
export function monthsBetween(from: string, to: string): number {
  const start = dayParts(from);
  const end = dayParts(to);
  const raw = (end.year - start.year) * MONTHS_PER_YEAR + (end.month - start.month);
  const adjusted = end.dayOfMonth < start.dayOfMonth ? raw - 1 : raw;
  return Math.max(0, adjusted);
}

/** Calendar day `months` after `day` (UTC arithmetic; day-of-month overflow rolls forward). */
export function addMonths(day: string, months: number): string {
  const parts = dayParts(day);
  const shifted = new Date(Date.UTC(parts.year, parts.month - 1 + months, parts.dayOfMonth));
  return shifted.toISOString().slice(0, ISO_DATE_LENGTH);
}

/** Straight-line depreciation by whole months, floored to VND and capped at the depreciable base. */
export function depreciationAt(
  acquisition: Pick<
    VehicleAcquisitionInput,
    'purchasePriceVnd' | 'purchasedOn' | 'salvageValueVnd' | 'usefulLifeMonths'
  >,
  asOfDay: string,
): Depreciation {
  const base = Math.max(0, acquisition.purchasePriceVnd - acquisition.salvageValueVnd);
  const monthlyDepreciationVnd = Math.floor(base / acquisition.usefulLifeMonths);
  const monthsElapsed = monthsBetween(acquisition.purchasedOn, asOfDay);
  const accumulatedDepreciationVnd = Math.min(base, monthlyDepreciationVnd * monthsElapsed);
  return {
    accumulatedDepreciationVnd,
    bookValueVnd: acquisition.purchasePriceVnd - accumulatedDepreciationVnd,
    monthlyDepreciationVnd,
    monthsElapsed,
  };
}

// ---------------------------------------------------------------------------
// Expense ledger (US-024, BR-09)
// ---------------------------------------------------------------------------

export const expenseCategorySchema = z.enum([
  'MAINTENANCE',
  'FUEL',
  'INSURANCE',
  'REGISTRATION',
  'RENT',
  'UTILITIES',
  'SALARY',
  'OTHER',
]);

export const EXPENSE_CATEGORIES = expenseCategorySchema.options;

export const expenseInputSchema = z
  .object({
    amountVnd: z.number().int().min(1).max(MAX_EXPENSE_VND),
    category: expenseCategorySchema,
    description: z.string().trim().min(MIN_DESCRIPTION).max(MAX_DESCRIPTION),
    idempotencyKey: z.string().uuid(),
    method: paymentMethodSchema,
    notes: z.string().trim().max(MAX_NOTES).default(''),
    paidOn: z.iso.date(),
    reference: z.string().trim().max(MAX_REFERENCE).default(''),
    vehicleId: z.string().min(1).nullable().default(null),
  })
  .strict();

export const expenseReversalInputSchema = z
  .object({ reason: z.string().trim().min(MIN_DESCRIPTION).max(MAX_DESCRIPTION) })
  .strict();

/** One immutable ledger row; a reversal is a second row pointing at the first (BR-09). */
export const expenseSchema = z.object({
  amountVnd: z.number().int().min(1).max(MAX_EXPENSE_VND),
  category: expenseCategorySchema,
  createdAt: z.iso.datetime(),
  description: z.string(),
  id: z.string(),
  method: paymentMethodSchema,
  notes: z.string(),
  paidOn: z.iso.date(),
  recordedById: z.string(),
  recordedByName: z.string(),
  reference: z.string(),
  reversalOfId: z.string().nullable(),
  reversedByExpenseId: z.string().nullable(),
  vehicleCode: z.string().nullable(),
  vehicleId: z.string().nullable(),
});

/** Parsed from query strings, so unknown keys are ignored rather than rejected. */
export const expenseListQuerySchema = z.object({
  category: expenseCategorySchema.optional(),
  from: z.iso.date().optional(),
  limit: z.coerce.number().int().min(1).max(MAX_LIST_LIMIT).default(DEFAULT_LIST_LIMIT),
  to: z.iso.date().optional(),
  vehicleId: z.string().min(1).optional(),
});

export const expenseCategoryTotalSchema = z.object({
  category: expenseCategorySchema,
  netVnd: signedVndSchema,
});

export const expenseTotalsSchema = z.object({
  byCategory: z.array(expenseCategoryTotalSchema),
  cashVnd: signedVndSchema,
  netVnd: signedVndSchema,
  reversedVnd: vndSchema,
  transferVnd: signedVndSchema,
});

export const expenseListSchema = z.object({
  count: countSchema,
  items: z.array(expenseSchema),
  totals: expenseTotalsSchema,
});

// ---------------------------------------------------------------------------
// Fleet economics report (US-025, BR-08)
// ---------------------------------------------------------------------------

export const fleetEconomicsQuerySchema = z.object({ asOf: z.iso.date().optional() });

export const breakEvenStatusSchema = z.enum([
  'NO_COST',
  'RECOVERED',
  'PROJECTED',
  'NOT_PROJECTABLE',
]);

export const breakEvenSchema = z.object({
  monthsRemaining: countSchema.nullable(),
  projectedOn: z.iso.date().nullable(),
  status: breakEvenStatusSchema,
});

export const fleetEconomicsRowSchema = z.object({
  accumulatedDepreciationVnd: vndSchema,
  acquisition: vehicleAcquisitionSchema.nullable(),
  bookValueVnd: vndSchema,
  breakEven: breakEvenSchema,
  code: z.string(),
  expensesVnd: signedVndSchema,
  model: z.string(),
  monthlyDepreciationVnd: vndSchema,
  netVnd: signedVndSchema,
  plate: z.string(),
  purchasePriceVnd: vndSchema,
  recoveredPercent: percentSchema,
  rentalDays: countSchema,
  revenueVnd: signedVndSchema,
  status: vehicleStatusSchema,
  trailingNetVnd: signedVndSchema,
  typeCode: z.string(),
  vehicleId: z.string(),
});

export const fleetEconomicsTotalsSchema = z.object({
  accumulatedDepreciationVnd: vndSchema,
  bookValueVnd: vndSchema,
  expensesVnd: signedVndSchema,
  netVnd: signedVndSchema,
  purchasePriceVnd: vndSchema,
  rentalDays: countSchema,
  revenueVnd: signedVndSchema,
  unallocatedExpensesVnd: signedVndSchema,
  unallocatedRevenueVnd: signedVndSchema,
  vehicleCount: countSchema,
  vehiclesRecovered: countSchema,
});

export const fleetEconomicsReportSchema = z.object({
  asOf: z.iso.date(),
  generatedAt: z.iso.datetime(),
  rows: z.array(fleetEconomicsRowSchema),
  timeZone: z.string(),
  totals: fleetEconomicsTotalsSchema,
});

export const FLEET_ECONOMICS_COLUMNS = [
  'Xe',
  'Biển số',
  'Dòng xe',
  'Giá vốn',
  'Khấu hao/tháng',
  'Khấu hao lũy kế',
  'Giá trị còn lại',
  'Doanh thu',
  'Ngày thuê',
  'Chi phí',
  'Ròng',
  'Thu hồi (%)',
  'Hòa vốn',
  'Dự kiến',
] as const;

export interface BreakEvenInput {
  asOf: string;
  netVnd: number;
  purchasePriceVnd: number;
  trailingNetVnd: number;
}

/** Share of the purchase price recovered by the cumulative net, clamped to 0–100. */
export function recoveredPercent(purchasePriceVnd: number, netVnd: number): number {
  if (purchasePriceVnd <= 0) return 0;
  const raw = Math.floor((netVnd * PERCENT) / purchasePriceVnd);
  return Math.min(PERCENT, Math.max(0, raw));
}

/**
 * NO_COST without a price; RECOVERED once the cumulative net covers it; otherwise the trailing
 * 90-day net is scaled to a 30-day month and, when positive, gives the remaining months.
 */
export function breakEvenProjection(input: BreakEvenInput): BreakEven {
  if (input.purchasePriceVnd <= 0) {
    return { monthsRemaining: null, projectedOn: null, status: 'NO_COST' };
  }
  if (input.netVnd >= input.purchasePriceVnd) {
    return { monthsRemaining: 0, projectedOn: null, status: 'RECOVERED' };
  }
  const monthlyRate = (input.trailingNetVnd * DAYS_PER_MONTH) / TRAILING_WINDOW_DAYS;
  if (monthlyRate <= 0) {
    return { monthsRemaining: null, projectedOn: null, status: 'NOT_PROJECTABLE' };
  }
  const monthsRemaining = Math.ceil((input.purchasePriceVnd - input.netVnd) / monthlyRate);
  return {
    monthsRemaining,
    projectedOn: addMonths(input.asOf, monthsRemaining),
    status: 'PROJECTED',
  };
}

export type VehicleAcquisitionInput = z.infer<typeof vehicleAcquisitionInputSchema>;
export type VehicleAcquisition = z.infer<typeof vehicleAcquisitionSchema>;
export type VehicleAcquisitionView = z.infer<typeof vehicleAcquisitionViewSchema>;
export type Depreciation = z.infer<typeof depreciationSchema>;
export type ExpenseCategory = z.infer<typeof expenseCategorySchema>;
export type ExpenseInput = z.infer<typeof expenseInputSchema>;
export type ExpenseReversalInput = z.infer<typeof expenseReversalInputSchema>;
export type Expense = z.infer<typeof expenseSchema>;
export type ExpenseListQuery = z.infer<typeof expenseListQuerySchema>;
export type ExpenseCategoryTotal = z.infer<typeof expenseCategoryTotalSchema>;
export type ExpenseTotals = z.infer<typeof expenseTotalsSchema>;
export type ExpenseList = z.infer<typeof expenseListSchema>;
export type FleetEconomicsQuery = z.infer<typeof fleetEconomicsQuerySchema>;
export type BreakEvenStatus = z.infer<typeof breakEvenStatusSchema>;
export type BreakEven = z.infer<typeof breakEvenSchema>;
export type FleetEconomicsRow = z.infer<typeof fleetEconomicsRowSchema>;
export type FleetEconomicsTotals = z.infer<typeof fleetEconomicsTotalsSchema>;
export type FleetEconomicsReport = z.infer<typeof fleetEconomicsReportSchema>;
