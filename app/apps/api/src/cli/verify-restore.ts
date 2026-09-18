export interface RestoreCounts {
  accounts: number;
  auditEvents: number;
  contracts: number;
  customers: number;
  payments: number;
  vehicles: number;
}

/** What the drill reads from the restored database; every figure is a count, never a row. */
export interface RestoreSnapshot {
  activeOwners: number;
  appliedMigrations: string[];
  counts: RestoreCounts;
  /** Settled contracts whose ledger net is below the frozen `paidVnd` of the settlement. */
  ledgerMismatches: number;
  /** Contracts whose refunds exceed their payments. */
  negativeLedgers: number;
  /** Payments whose contract no longer exists (a partial restore). */
  orphanPayments: number;
}

export interface RestoreVerdict {
  issues: string[];
  ok: boolean;
}

/** US-020 restore drill: the restored data must be complete, consistent and schema-current. */
export function evaluateRestore(
  snapshot: RestoreSnapshot,
  expectedMigrations: readonly string[],
): RestoreVerdict {
  const issues: string[] = [];
  if (snapshot.counts.accounts === 0) issues.push('No account was restored');
  if (snapshot.activeOwners === 0) issues.push('No active Owner account was restored');
  if (snapshot.orphanPayments > 0) {
    issues.push(`${snapshot.orphanPayments} payment(s) reference a missing contract`);
  }
  if (snapshot.negativeLedgers > 0) {
    issues.push(`${snapshot.negativeLedgers} contract(s) refunded more than they collected`);
  }
  if (snapshot.ledgerMismatches > 0) {
    issues.push(`${snapshot.ledgerMismatches} settlement(s) record more paid than the ledger`);
  }
  const applied = new Set(snapshot.appliedMigrations);
  const missing = expectedMigrations.filter((name) => !applied.has(name));
  if (missing.length > 0) issues.push(`Missing migration(s): ${missing.join(', ')}`);
  return { issues, ok: issues.length === 0 };
}
