#!/usr/bin/env node
// Alert hook: exits 1 when the newest backup is missing or older than the threshold.
// Usage: node ops/backup/check-backup-age.mjs [backupDir] [maxAgeHours]
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const HOURS_TO_MS = 3_600_000;
const DEFAULT_MAX_AGE_HOURS = 26;

export function newestBackup(directory) {
  let newest;
  for (const name of readdirSync(directory)) {
    if (!/^rental-.*\.dump\.gz$/.test(name)) continue;
    const modifiedAt = statSync(join(directory, name)).mtimeMs;
    if (!newest || modifiedAt > newest.modifiedAt) newest = { modifiedAt, name };
  }
  return newest;
}

export function checkBackupAge(directory, maxAgeHours, now = Date.now()) {
  const newest = newestBackup(directory);
  if (!newest) return { ok: false, reason: 'no backup found' };
  const ageHours = (now - newest.modifiedAt) / HOURS_TO_MS;
  return {
    ageHours: Math.round(ageHours * 10) / 10,
    file: newest.name,
    ok: ageHours <= maxAgeHours,
    reason: ageHours <= maxAgeHours ? undefined : 'backup too old',
  };
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  const [directory = '/var/backups/rental', hours = String(DEFAULT_MAX_AGE_HOURS)] =
    process.argv.slice(2);
  const result = checkBackupAge(directory, Number(hours));
  process.stdout.write(`${JSON.stringify({ event: 'backup.age', ...result })}\n`);
  process.exitCode = result.ok ? 0 : 1;
}
