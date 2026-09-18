import { PrismaClient } from '@prisma/client';
import { ownerSeedSchema, seedOwner } from './seed-owner.js';

/**
 * `npm run seed:owner --workspace @rental/api`
 * Reads SEED_OWNER_USERNAME / SEED_OWNER_PASSWORD / SEED_OWNER_NAME and DATABASE_URL.
 * Never prints the password; exits non-zero when the input is invalid.
 */
async function main(): Promise<void> {
  const parsed = ownerSeedSchema.safeParse(process.env);
  if (!parsed.success) {
    process.stderr.write(
      `Invalid seed input: ${parsed.error.issues.map((i) => i.path.join('.')).join(', ')}\n`,
    );
    process.exitCode = 1;
    return;
  }
  const prisma = new PrismaClient();
  try {
    const result = await seedOwner(prisma.account, parsed.data);
    process.stdout.write(`${JSON.stringify({ event: 'seed.owner', ...result })}\n`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  process.stderr.write(
    `Owner seed failed: ${error instanceof Error ? error.message : 'unknown'}\n`,
  );
  process.exitCode = 1;
});
