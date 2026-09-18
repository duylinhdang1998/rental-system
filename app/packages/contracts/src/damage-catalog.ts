import { z } from 'zod';

const MAX_VND = 1_000_000_000;
const MIN_CODE = 2;
const MAX_CODE = 24;
const MIN_NAME = 2;
const MAX_NAME = 120;
const vndSchema = z.number().int().min(0).max(MAX_VND);

const booleanQuerySchema = z
  .enum(['true', 'false'])
  .default('false')
  .transform((value) => value === 'true');

/** US-026: one priced damage item; the code is upper-cased so "guong" and "GUONG" collide. */
export const damageItemInputSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(MIN_CODE)
      .max(MAX_CODE)
      .transform((value) => value.toUpperCase()),
    name: z.string().trim().min(MIN_NAME).max(MAX_NAME),
    priceVnd: vndSchema,
  })
  .strict();

export const damageItemUpdateSchema = z
  .object({
    active: z.boolean().optional(),
    name: z.string().trim().min(MIN_NAME).max(MAX_NAME).optional(),
    priceVnd: vndSchema.optional(),
  })
  .strict();

export const damageItemListQuerySchema = z.object({ includeInactive: booleanQuerySchema }).strict();

export const damageItemSchema = z.object({
  active: z.boolean(),
  code: z.string(),
  createdAt: z.iso.datetime(),
  id: z.string(),
  name: z.string(),
  priceVnd: vndSchema,
  updatedAt: z.iso.datetime(),
});

export const damageItemListSchema = z.object({ items: z.array(damageItemSchema) });

export type DamageItemInput = z.infer<typeof damageItemInputSchema>;
export type DamageItemUpdateInput = z.infer<typeof damageItemUpdateSchema>;
export type DamageItemListQuery = z.infer<typeof damageItemListQuerySchema>;
export type DamageItem = z.infer<typeof damageItemSchema>;
export type DamageItemList = z.infer<typeof damageItemListSchema>;
