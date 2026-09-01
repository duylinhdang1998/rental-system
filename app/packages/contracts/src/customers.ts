import { z } from 'zod';

const MIN_DETAIL_LENGTH = 3;
const MAX_CONTACTS = 5;
const MAX_NAME_LENGTH = 120;
const MAX_NATIONALITY_LENGTH = 60;
const MAX_REASON_LENGTH = 240;
const MAX_TAGS = 10;

const contactFields = { primary: z.boolean().default(false) };
const phoneValueSchema = z
  .string()
  .trim()
  .regex(/^(?:\+?84|0)[\d\s.-]{8,14}$/);

export const customerContactSchema = z.discriminatedUnion('type', [
  z.object({ ...contactFields, type: z.literal('PHONE'), value: phoneValueSchema }).strict(),
  z.object({ ...contactFields, type: z.literal('EMAIL'), value: z.email() }).strict(),
]);

export const customerTagSchema = z
  .object({
    code: z.enum(['BLACKLIST', 'VIP', 'WATCHLIST']),
    reason: z.string().trim().min(MIN_DETAIL_LENGTH).max(MAX_REASON_LENGTH),
  })
  .strict();

export const customerInputSchema = z
  .object({
    contacts: z.array(customerContactSchema).min(1).max(MAX_CONTACTS),
    name: z.string().trim().min(2).max(MAX_NAME_LENGTH),
    nationality: z.string().trim().min(2).max(MAX_NATIONALITY_LENGTH),
    tags: z.array(customerTagSchema).max(MAX_TAGS).default([]),
  })
  .strict();

export type CustomerInput = z.infer<typeof customerInputSchema>;
export type CustomerContact = z.infer<typeof customerContactSchema>;
export type CustomerTag = z.infer<typeof customerTagSchema>;

export const customerSummarySchema = z.object({
  contacts: z.array(customerContactSchema),
  id: z.string(),
  name: z.string(),
  nationality: z.string(),
  warning: customerTagSchema.optional(),
});
export const customerListSchema = z.object({ items: z.array(customerSummarySchema) });

export type CustomerSummary = z.infer<typeof customerSummarySchema>;
