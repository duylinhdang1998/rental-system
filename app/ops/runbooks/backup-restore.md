# Runbook — Backup and restore

**Targets:** RPO 24 hours (daily dump), RTO 60 minutes (restore + verification + switch).
**Owner:** DevOps on call. **Evidence:** the JSON lines printed by each step, kept with the
release record.

## Daily backup

1. Cron on the database host or a maintenance container, 01:00 Asia/Ho_Chi_Minh:
   `DATABASE_URL=… BACKUP_DIR=/var/backups/rental RETENTION_DAYS=30 ops/backup/backup.sh`.
2. The dump is `rental-<UTC stamp>.dump.gz` with a `.sha256` next to it. Disk encryption at
   rest is provided by the host volume; copy the pair off-site (object storage with its own
   retention) right after the script prints `backup.completed`.
3. `ops/backup/check-backup-age.mjs /var/backups/rental 26` runs hourly from the monitor and
   pages when it exits 1 (no dump, or the newest dump is older than 26 hours).

## Restore drill (weekly and before every release)

1. `ADMIN_DATABASE_URL=postgresql://admin@host/postgres BACKUP_DIR=/var/backups/rental ops/backup/restore-drill.sh`
2. The script creates `rental_restore_drill`, restores the newest dump, runs
   `verify:restore` against it and drops the scratch database on exit.
3. The verdict line `restore.verify` must say `"ok":true` with the counts you expect for the
   day (contracts, payments, accounts, one active Owner, zero orphans, zero mismatches, every
   migration folder applied). A FAIL blocks the release until the cause is understood.

## Real restore

1. Declare the incident (see `incident-response.md`) and stop the API (`docker stop` or scale
   to zero) so no new writes land during the restore.
2. Pick the dump: the newest one that predates the corruption. Verify the checksum by running
   `ops/backup/restore.sh <dump> <target url>`; the script refuses a dump whose sha256 differs.
3. Restore into a fresh database name, not over the live one, then run `verify:restore` with
   `DATABASE_URL` pointing at it.
4. When the verdict is PASS, point the API `DATABASE_URL` at the restored database, run
   `npx prisma migrate deploy` (no-op when the dump already carries every migration), start the
   API and check `GET /api/health/ready` returns 200 with `"database":"up"`.
5. Ask the Owner to confirm the latest contracts and payments on the operations board and
   receivables page; record the data gap (everything after the dump) for manual re-entry.

## Notes

- Demo data never enters production: `DEMO_MODE=false` is enforced by the environment policy,
  and the first Owner comes from `seed:owner`, never from the demo namespace.
- Dumps contain customer documents and payment references. Treat them as confidential; the
  retention window is 30 days locally and per the storage policy off-site.
