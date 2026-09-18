# Operations tooling

Scripts that back the go-live runbooks in `runbooks/`. They run on any host with `bash`,
PostgreSQL client tools (`pg_dump`, `pg_restore`, `psql`) and Node 24; none of them needs the
application containers.

| Script                                           | Purpose                                                        | Runbook                         |
| ------------------------------------------------ | -------------------------------------------------------------- | ------------------------------- |
| `backup/backup.sh`                               | Daily custom-format dump, gzip, sha256 and retention           | `runbooks/backup-restore.md`    |
| `backup/restore.sh <dump> <url>`                 | Verified restore into an existing database                     | `runbooks/backup-restore.md`    |
| `backup/restore-drill.sh`                        | Restore the newest dump into a scratch database and verify it  | `runbooks/backup-restore.md`    |
| `backup/check-backup-age.mjs [dir] [hours]`      | Exit 1 when the newest dump is missing or too old (alert hook) | `runbooks/monitoring-alerts.md` |
| `load/smoke-load.mjs`                            | Read-only load smoke with p50/p95 and a status histogram       | `runbooks/deploy-rollback.md`   |
| `npm run seed:owner --workspace @rental/api`     | Create the first Owner account once (idempotent)               | `runbooks/deploy-rollback.md`   |
| `npm run verify:restore --workspace @rental/api` | Restore verdict (PASS/FAIL) for a restored database            | `runbooks/backup-restore.md`    |

Every script prints one JSON line on success so a scheduler or log shipper can index it, and
exits non-zero on failure. Secrets are read from the environment only; never put a
`DATABASE_URL` on a command line that ends up in shell history or CI logs.
