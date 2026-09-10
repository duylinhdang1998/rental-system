import { z } from 'zod';

const MAX_VND = 1_000_000_000_000;
const vndSchema = z.number().int().min(0).max(MAX_VND);
/** Net movement by method inside a period may be negative when refunds exceed receipts. */
const signedVndSchema = z.number().int().min(-MAX_VND).max(MAX_VND);
const countSchema = z.number().int().min(0);

export const MAX_REPORT_DAYS = 92;
export const REPORT_DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;
const daySchema = z.string().regex(REPORT_DAY_PATTERN);

/** Parsed from query strings, so unknown keys are ignored rather than rejected. */
export const reportRangeSchema = z.object({ from: daySchema, to: daySchema });

export const revenueTotalsSchema = z.object({
  cashVnd: vndSchema,
  contractCount: countSchema,
  netVnd: vndSchema,
  paymentCount: countSchema,
  refundVnd: vndSchema,
  transferVnd: vndSchema,
});

export const dailyRevenueRowSchema = revenueTotalsSchema.omit({ contractCount: true }).extend({
  day: daySchema,
});

export const employeeRevenueRowSchema = revenueTotalsSchema.omit({ contractCount: true }).extend({
  employeeId: z.string(),
  employeeName: z.string(),
});

export const agingBucketSchema = z.enum(['CURRENT', 'DAYS_1_7', 'DAYS_8_30', 'OVER_30']);

export const agingRowSchema = z.object({
  bucket: agingBucketSchema,
  count: countSchema,
  totalVnd: vndSchema,
});

export const receivableAgingSchema = z.object({
  count: countSchema,
  rows: z.array(agingRowSchema),
  totalVnd: vndSchema,
});

/** One line of the approved 14-column client layout (daily revenue sample). */
export const reportContractRowSchema = z.object({
  address: z.string(),
  cashVnd: signedVndSchema,
  code: z.string(),
  contact: z.string(),
  contractId: z.string(),
  customerName: z.string(),
  depositOrDocument: z.string(),
  employeeName: z.string(),
  notes: z.string(),
  rentalDays: countSchema,
  returnAt: z.iso.datetime().nullable(),
  sequence: countSchema,
  time: z.iso.datetime(),
  transferVnd: signedVndSchema,
  unitPriceVnd: vndSchema,
  vehicleCodes: z.array(z.string()),
});

export const revenueReportSchema = z.object({
  aging: receivableAgingSchema,
  days: z.array(dailyRevenueRowSchema),
  employees: z.array(employeeRevenueRowSchema),
  from: daySchema,
  generatedAt: z.iso.datetime(),
  rows: z.array(reportContractRowSchema),
  timeZone: z.string(),
  to: daySchema,
  totals: revenueTotalsSchema,
});

export const REPORT_COLUMNS = [
  'STT',
  'Khách hàng',
  'Liên hệ',
  'Thời gian',
  'Ngày trả',
  'Xe',
  'Số ngày thuê',
  'Đơn giá',
  'Chuyển khoản',
  'Tiền mặt',
  'Cọc / Giấy tờ',
  'Địa chỉ',
  'Nhân viên',
  'Ghi chú',
] as const;

export type ReportRange = z.infer<typeof reportRangeSchema>;
export type RevenueTotals = z.infer<typeof revenueTotalsSchema>;
export type DailyRevenueRow = z.infer<typeof dailyRevenueRowSchema>;
export type EmployeeRevenueRow = z.infer<typeof employeeRevenueRowSchema>;
export type AgingBucket = z.infer<typeof agingBucketSchema>;
export type AgingRow = z.infer<typeof agingRowSchema>;
export type ReceivableAging = z.infer<typeof receivableAgingSchema>;
export type ReportContractRow = z.infer<typeof reportContractRowSchema>;
export type RevenueReport = z.infer<typeof revenueReportSchema>;
