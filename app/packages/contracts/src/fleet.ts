import { z } from 'zod';

const MAX_CODE_LENGTH = 32;
const MAX_COLOR_LENGTH = 40;
const MAX_MODEL_LENGTH = 80;
const MAX_PLATE_LENGTH = 24;
const MIN_PLATE_LENGTH = 5;
const MIN_VEHICLE_YEAR = 1990;
const MAX_VEHICLE_YEAR = 2100;
const MAX_STATUS_REASON_LENGTH = 240;
const MIN_STATUS_REASON_LENGTH = 3;

export const vehicleStatusSchema = z.enum([
  'AVAILABLE',
  'RESERVED',
  'RENTED',
  'MAINTENANCE',
  'DAMAGED',
  'LOST',
  'RETIRED',
]);

export const vehicleInputSchema = z.object({
  code: z.string().trim().min(2).max(MAX_CODE_LENGTH),
  color: z.string().trim().min(1).max(MAX_COLOR_LENGTH),
  model: z.string().trim().min(1).max(MAX_MODEL_LENGTH),
  plate: z.string().trim().min(MIN_PLATE_LENGTH).max(MAX_PLATE_LENGTH),
  typeCode: z
    .string()
    .trim()
    .min(2)
    .max(MAX_PLATE_LENGTH)
    .transform((value) => value.toUpperCase()),
  year: z.number().int().min(MIN_VEHICLE_YEAR).max(MAX_VEHICLE_YEAR),
});

export const vehicleTransitionSchema = z.object({
  reason: z.string().trim().min(MIN_STATUS_REASON_LENGTH).max(MAX_STATUS_REASON_LENGTH),
  status: vehicleStatusSchema,
});

export type VehicleInput = z.infer<typeof vehicleInputSchema>;
export type VehicleStatus = z.infer<typeof vehicleStatusSchema>;
export type VehicleTransitionInput = z.infer<typeof vehicleTransitionSchema>;

export const vehicleSchema = vehicleInputSchema.extend({
  id: z.string(),
  status: vehicleStatusSchema,
});
export const availabilityPeriodSchema = z.object({
  date: z.iso.date(),
  state: z.enum(['AVAILABLE', 'HELD', 'RENTED']),
});
export const vehicleCalendarRowSchema = z.object({
  code: z.string(),
  id: z.string(),
  periods: z.array(availabilityPeriodSchema),
  plate: z.string(),
});
export const fleetCalendarSchema = z.object({
  days: z.array(z.iso.date()),
  vehicles: z.array(vehicleCalendarRowSchema),
});
export const vehicleListSchema = z.object({ items: z.array(vehicleSchema) });

export type Vehicle = z.infer<typeof vehicleSchema>;
export type FleetCalendar = z.infer<typeof fleetCalendarSchema>;
export type AvailabilityState = z.infer<typeof availabilityPeriodSchema>['state'];
export type AvailabilityPeriod = z.infer<typeof availabilityPeriodSchema>;
export type VehicleCalendarRow = z.infer<typeof vehicleCalendarRowSchema>;

export interface VehicleStatusHistory {
  actorId: string;
  at: string;
  from: VehicleStatus;
  id: string;
  reason: string;
  to: VehicleStatus;
}
