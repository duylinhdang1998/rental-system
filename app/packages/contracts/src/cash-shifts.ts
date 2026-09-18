import { z } from 'zod';

const MAX_VND = 1_000_000_000;
const MAX_NOTE = 500;
const vndSchema = z.number().int().min(0).max(MAX_VND);
/** Net figures may go negative (a reversal of an expense from before the shift adds cash back). */
const signedVndSchema = z.number().int();

export const cashShiftStatusSchema = z.enum(['OPEN', 'CLOSED']);

export const cashShiftOpenInputSchema = z.object({ openingFloatVnd: vndSchema }).strict();

export const cashShiftCloseInputSchema = z
  .object({
    countedCashVnd: vndSchema,
    note: z.string().trim().max(MAX_NOTE).default(''),
  })
  .strict();

/** Cash movements inside the shift window; each figure has one direction (BR-04). */
export const cashMovementsSchema = z.object({
  cashCollectedVnd: vndSchema,
  cashExpensesVnd: signedVndSchema,
  cashRefundedVnd: vndSchema,
  depositRefundedVnd: vndSchema,
});

export const cashShiftExpectationSchema = cashMovementsSchema.extend({
  asOf: z.iso.datetime(),
  expectedCashVnd: signedVndSchema,
  openingFloatVnd: vndSchema,
});

export const cashShiftSchema = z.object({
  closedAt: z.iso.datetime().nullable(),
  closedById: z.string().nullable(),
  closedByName: z.string().nullable(),
  countedCashVnd: vndSchema.nullable(),
  expectedCashVnd: signedVndSchema.nullable(),
  id: z.string(),
  note: z.string(),
  openedAt: z.iso.datetime(),
  openedById: z.string(),
  openedByName: z.string(),
  openingFloatVnd: vndSchema,
  status: cashShiftStatusSchema,
  varianceVnd: signedVndSchema.nullable(),
});

export const cashShiftCurrentSchema = z.object({
  expectation: cashShiftExpectationSchema.nullable(),
  shift: cashShiftSchema.nullable(),
});

export const cashShiftListSchema = z.object({ items: z.array(cashShiftSchema) });

export type CashShiftStatus = z.infer<typeof cashShiftStatusSchema>;
export type CashShiftOpenInput = z.infer<typeof cashShiftOpenInputSchema>;
export type CashShiftCloseInput = z.infer<typeof cashShiftCloseInputSchema>;
export type CashMovements = z.infer<typeof cashMovementsSchema>;
export type CashShiftExpectation = z.infer<typeof cashShiftExpectationSchema>;
export type CashShift = z.infer<typeof cashShiftSchema>;
export type CashShiftCurrent = z.infer<typeof cashShiftCurrentSchema>;
export type CashShiftList = z.infer<typeof cashShiftListSchema>;

/** US-027: float + cash collected − cash refunded − cash deposit refunds − cash expenses. */
export function expectedCash(openingFloatVnd: number, movements: CashMovements): number {
  return (
    openingFloatVnd +
    movements.cashCollectedVnd -
    movements.cashRefundedVnd -
    movements.depositRefundedVnd -
    movements.cashExpensesVnd
  );
}

/** Counted minus expected: negative means cash is missing, positive means a surplus. */
export function cashVariance(countedCashVnd: number, expectedCashVnd: number): number {
  return countedCashVnd - expectedCashVnd;
}

export function cashNoteRequired(varianceVnd: number, note: string): boolean {
  return varianceVnd !== 0 && note.trim() === '';
}
