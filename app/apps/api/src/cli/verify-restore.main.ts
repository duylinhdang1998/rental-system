import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import { evaluateRestore, type RestoreSnapshot } from './verify-restore.js';

interface CountRow {
  count: bigint | number;
}

interface MigrationRow {
  migration_name: string;
}

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), '../../prisma/migrations');

function expectedMigrations(): string[] {
  return readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

async function scalar(prisma: PrismaClient, query: Promise<CountRow[]>): Promise<number> {
  const [row] = await query;
  return Number(row?.count ?? 0);
}

const LEDGER = `SELECT "contractId", SUM(CASE WHEN kind = 'PAYMENT' THEN "amountVnd" ELSE -"amountVnd" END) AS net FROM "ContractPayment" GROUP BY "contractId"`;

async function rowCounts(prisma: PrismaClient) {
  const [accounts, auditEvents, contracts, customers, payments, vehicles, activeOwners] =
    await Promise.all([
      prisma.account.count(),
      prisma.auditEvent.count(),
      prisma.contract.count(),
      prisma.customer.count(),
      prisma.contractPayment.count(),
      prisma.vehicle.count(),
      prisma.account.count({ where: { active: true, role: 'OWNER' } }),
    ]);
  return {
    activeOwners,
    counts: { accounts, auditEvents, contracts, customers, payments, vehicles },
  };
}

/** Static, parameterless read-only SQL: the consistency checks are not expressible in Prisma. */
async function consistency(prisma: PrismaClient) {
  const ledger = LEDGER;
  const orphanPayments = await scalar(
    prisma,
    prisma.$queryRawUnsafe<CountRow[]>(
      `SELECT COUNT(*) AS count FROM "ContractPayment" p LEFT JOIN "Contract" c ON c.id = p."contractId" WHERE c.id IS NULL`,
    ),
  );
  const negativeLedgers = await scalar(
    prisma,
    prisma.$queryRawUnsafe<CountRow[]>(
      `SELECT COUNT(*) AS count FROM (${ledger}) l WHERE l.net < 0`,
    ),
  );
  const ledgerMismatches = await scalar(
    prisma,
    prisma.$queryRawUnsafe<CountRow[]>(
      `SELECT COUNT(*) AS count FROM "ContractSettlement" s LEFT JOIN (${ledger}) l ON l."contractId" = s."contractId" WHERE COALESCE(l.net, 0) < s."paidVnd"`,
    ),
  );
  const migrations = await prisma.$queryRawUnsafe<MigrationRow[]>(
    `SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NOT NULL ORDER BY migration_name`,
  );
  return {
    appliedMigrations: migrations.map((row) => row.migration_name),
    ledgerMismatches,
    negativeLedgers,
    orphanPayments,
  };
}

async function snapshot(prisma: PrismaClient): Promise<RestoreSnapshot> {
  const [rows, checks] = await Promise.all([rowCounts(prisma), consistency(prisma)]);
  return { ...rows, ...checks };
}

/** `npm run verify:restore --workspace @rental/api` against the scratch database. */
async function main(): Promise<void> {
  const prisma = new PrismaClient();
  try {
    const restored = await snapshot(prisma);
    const verdict = evaluateRestore(restored, expectedMigrations());
    process.stdout.write(
      `${JSON.stringify({ event: 'restore.verify', ...restored, ...verdict })}\n`,
    );
    process.stdout.write(`${verdict.ok ? 'PASS' : 'FAIL'}\n`);
    if (!verdict.ok) process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  process.stderr.write(
    `Restore verification failed: ${error instanceof Error ? error.message : 'unknown'}\n`,
  );
  process.exitCode = 1;
});
