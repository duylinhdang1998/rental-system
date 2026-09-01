import { z } from 'zod';

const MAX_CODE_LENGTH = 24;
const MAX_NAME_LENGTH = 80;

export const vehicleTypeInputSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(MAX_CODE_LENGTH)
    .transform((value) => value.toUpperCase()),
  name: z.string().trim().min(2).max(MAX_NAME_LENGTH),
});

export type VehicleTypeInput = z.infer<typeof vehicleTypeInputSchema>;

export interface VehicleType extends VehicleTypeInput {
  id: string;
}
