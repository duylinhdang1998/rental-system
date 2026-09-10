import { z } from 'zod';
import { contractStatusSchema } from './contracts.js';
import { lateReturnPolicySchema } from './pricing.js';

const MAX_VND = 1_000_000_000;

export const boardItemKindSchema = z.enum(['OVERDUE', 'DUE_TODAY', 'PICKUP_TODAY']);

export const boardItemSchema = z.object({
  code: z.string(),
  contractId: z.string(),
  customerName: z.string(),
  dueAt: z.iso.datetime(),
  hoursLate: z.number().int().min(0),
  kind: boardItemKindSchema,
  status: contractStatusSchema,
  totalVnd: z.number().int().min(0).max(MAX_VND),
  vehicleCodes: z.array(z.string()),
});

export const fleetSummarySchema = z.object({
  available: z.number().int().nonnegative(),
  other: z.number().int().nonnegative(),
  rented: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});

export const operationsBoardSchema = z.object({
  activeRentals: z.number().int().nonnegative(),
  availableVehicles: z.number().int().nonnegative(),
  dueToday: z.number().int().nonnegative(),
  fleet: fleetSummarySchema,
  generatedAt: z.iso.datetime(),
  items: z.array(boardItemSchema),
  maxOverdueHours: z.number().int().nonnegative(),
  nearestDueAt: z.iso.datetime().nullable(),
  overdue: z.number().int().nonnegative(),
  timeZone: z.string(),
});

export const returnQueueKindSchema = z.enum(['OVERDUE', 'DUE_TODAY', 'LATER']);

export const returnQueueLineSchema = z.object({
  endAt: z.iso.datetime(),
  hoursLate: z.number().int().min(0),
  kind: returnQueueKindSchema,
  lateReturnPolicy: lateReturnPolicySchema,
  lineId: z.string(),
  vehicleCode: z.string(),
  vehicleId: z.string(),
});

export const returnQueueItemSchema = z.object({
  code: z.string(),
  contractId: z.string(),
  customerName: z.string(),
  depositVnd: z.number().int().min(0).max(MAX_VND),
  hoursLate: z.number().int().min(0),
  kind: returnQueueKindSchema,
  lines: z.array(returnQueueLineSchema),
  nextDueAt: z.iso.datetime(),
  returnedCount: z.number().int().nonnegative(),
  status: contractStatusSchema,
  vehicleCount: z.number().int().nonnegative(),
});

export const returnQueueSchema = z.object({
  dueToday: z.number().int().nonnegative(),
  generatedAt: z.iso.datetime(),
  items: z.array(returnQueueItemSchema),
  overdue: z.number().int().nonnegative(),
  renting: z.number().int().nonnegative(),
  timeZone: z.string(),
});

export type ReturnQueueKind = z.infer<typeof returnQueueKindSchema>;
export type ReturnQueueLine = z.infer<typeof returnQueueLineSchema>;
export type ReturnQueueItem = z.infer<typeof returnQueueItemSchema>;
export type ReturnQueue = z.infer<typeof returnQueueSchema>;
export type BoardItemKind = z.infer<typeof boardItemKindSchema>;
export type BoardItem = z.infer<typeof boardItemSchema>;
export type FleetSummary = z.infer<typeof fleetSummarySchema>;
export type OperationsBoard = z.infer<typeof operationsBoardSchema>;
