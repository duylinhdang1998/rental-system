import { z } from 'zod';

const MAX_PASSWORD_LENGTH = 200;
const MAX_USERNAME_LENGTH = 80;

export const USER_ROLES = ['OWNER', 'STAFF'] as const;
export const userRoleSchema = z.enum(USER_ROLES);
export type UserRole = z.infer<typeof userRoleSchema>;

export const loginInputSchema = z
  .object({
    password: z.string().min(1).max(MAX_PASSWORD_LENGTH),
    username: z.string().trim().min(1).max(MAX_USERNAME_LENGTH),
  })
  .strict();

export type LoginInput = z.infer<typeof loginInputSchema>;

export interface AuthenticatedUser {
  id: string;
  name: string;
  role: UserRole;
  username: string;
}

export interface SessionResponse {
  user: AuthenticatedUser;
}
