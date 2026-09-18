import { mkdtempSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkBackupAge } from '../../ops/backup/check-backup-age.mjs';

const HOUR = 3_600_000;

describe('Feature: Security hardening, observability and go-live readiness — backup age alert', () => {
  describe('Scenario: Daily backup is restored into a scratch database and verified', () => {
    it('passes for a fresh dump and fails for a stale or missing one', () => {
      const directory = mkdtempSync(join(tmpdir(), 'rental-backups-'));
      const now = Date.now();
      expect(checkBackupAge(directory, 26, now)).toMatchObject({
        ok: false,
        reason: 'no backup found',
      });

      const stale = join(directory, 'rental-20260916T010000Z.dump.gz');
      writeFileSync(stale, 'stale');
      utimesSync(stale, new Date(now - 40 * HOUR), new Date(now - 40 * HOUR));
      expect(checkBackupAge(directory, 26, now)).toMatchObject({
        ok: false,
        reason: 'backup too old',
      });

      const fresh = join(directory, 'rental-20260918T010000Z.dump.gz');
      writeFileSync(fresh, 'fresh');
      utimesSync(fresh, new Date(now - 2 * HOUR), new Date(now - 2 * HOUR));
      writeFileSync(join(directory, 'notes.txt'), 'ignored');
      expect(checkBackupAge(directory, 26, now)).toMatchObject({
        ageHours: 2,
        file: 'rental-20260918T010000Z.dump.gz',
        ok: true,
      });
    });
  });
});
