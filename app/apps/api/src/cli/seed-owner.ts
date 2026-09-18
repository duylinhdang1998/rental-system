import { randomUUID } from 'node:crypto';
import { passwordSchema, usernameSchema } from '@rental/contracts';
import { hash } from 'argon2';
import { z } from 'zod';

const MIN_SEED_PASSWORD_LENGTH = 12;
const MAX_NAME_LENGTH = 120;

/** The first Owner comes from the deployment environment, never from a demo default. */
export const ownerSeedSchema = z.object({
  SEED_OWNER_NAME: z.string().trim().min(1).max(MAX_NAME_LENGTH).default('Chủ cửa hàng'),
  SEED_OWNER_PASSWORD: passwordSchema.min(MIN_SEED_PASSWORD_LENGTH),
  SEED_OWNER_USERNAME: usernameSchema,
});
export type OwnerSeedInput = z.infer<typeof ownerSeedSchema>;

export interface SeedAccountData {
  active: boolean;
  id: string;
  name: string;
  passwordHash: string;
  role: 'OWNER';
  username: string;
}

export interface SeedAccountClient {
  create(args: { data: SeedAccountData }): Promise<unknown>;
  findUnique(args: { where: { username: string } }): Promise<{ id: string } | null>;
}

export interface SeedOutcome {
  outcome: 'created' | 'exists';
  username: string;
}

/** Idempotent: a second run reports the existing account and changes nothing. */
export async function seedOwner(
  accounts: SeedAccountClient,
  input: OwnerSeedInput,
): Promise<SeedOutcome> {
  const username = input.SEED_OWNER_USERNAME;
  const existing = await accounts.findUnique({ where: { username } });
  if (existing) return { outcome: 'exists', username };
  await accounts.create({
    data: {
      active: true,
      id: randomUUID(),
      name: input.SEED_OWNER_NAME,
      passwordHash: await hash(input.SEED_OWNER_PASSWORD),
      role: 'OWNER',
      username,
    },
  });
  return { outcome: 'created', username };
}
