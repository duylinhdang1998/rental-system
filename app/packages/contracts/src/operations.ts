import { z } from 'zod';
import { contractStatusSchema } from './contracts.js';

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

export type BoardItemKind = z.infer<typeof boardItemKindSchema>;
export type BoardItem = z.infer<typeof boardItemSchema>;
export type FleetSummary = z.infer<typeof fleetSummarySchema>;
export type OperationsBoard = z.infer<typeof operationsBoardSchema>;
