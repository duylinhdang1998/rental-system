import { z } from 'zod';
import { userRoleSchema } from './auth.js';

export const MIN_PASSWORD_LENGTH = 10;
export const MAX_PASSWORD_LENGTH = 200;
const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 80;
const MAX_NAME_LENGTH = 120;

/** Usernames are lower-case handles: letters, digits, dot, underscore and dash. */
export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(MIN_USERNAME_LENGTH)
  .max(MAX_USERNAME_LENGTH)
  .regex(/^[a-z0-9._-]+$/, 'Tên đăng nhập chỉ gồm chữ, số, dấu chấm, gạch dưới hoặc gạch ngang');

export const passwordSchema = z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH);

export const employeeSchema = z.object({
  active: z.boolean(),
  createdAt: z.string().optional(),
  id: z.string(),
  name: z.string(),
  role: userRoleSchema,
  username: z.string(),
});
export type Employee = z.infer<typeof employeeSchema>;

export const employeeListSchema = z.object({
  count: z.number().int().nonnegative(),
  items: z.array(employeeSchema),
});
export type EmployeeList = z.infer<typeof employeeListSchema>;

export const createEmployeeInputSchema = z
  .object({
    name: z.string().trim().min(1).max(MAX_NAME_LENGTH),
    password: passwordSchema,
    role: userRoleSchema.default('STAFF'),
    username: usernameSchema,
  })
  .strict();
export type CreateEmployeeInput = z.infer<typeof createEmployeeInputSchema>;

export const employeeStatusInputSchema = z.object({ active: z.boolean() }).strict();
export type EmployeeStatusInput = z.infer<typeof employeeStatusInputSchema>;

export const resetPasswordInputSchema = z.object({ password: passwordSchema }).strict();
export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>;
