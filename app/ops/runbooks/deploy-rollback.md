# Runbook — Deploy and rollback

## Preconditions

- CI `quality-gates` is green on the commit (audit, format, lint, typecheck, coverage, build,
  Playwright).
- The restore drill of the day passed (`backup-restore.md`).
- The previous image tag or commit is written in the release record so rollback needs no lookup.
- Production environment carries explicit `SESSION_SECRET`, `CORS_ORIGINS`, `DATABASE_URL`,
  `DEMO_MODE=false`, `RATE_LIMIT_ENABLED=true` and `TRUST_PROXY_HOPS` equal to the number of
  proxies in front of the API. Startup refuses anything else.

## Deploy

1. Take a backup (`ops/backup/backup.sh`) and note the file name in the release record.
2. Apply migrations with the migration identity: `npx prisma migrate deploy` from `apps/api`.
   Migrations are forward-only and additive, so the previous API version keeps working during
   the rollout.
3. Roll the API image, then the admin static bundle. Wait for `GET /api/health/ready` = 200.
4. Smoke: sign in as the Owner, open the operations board, receivables and audit log; run
   `node ops/load/smoke-load.mjs --base https://api.example --username <staff> --password … --requests 200 --concurrency 10 --p95 500`
   against staging first (raise `RATE_LIMIT_*` there); in production keep the request count
   under the read limit or expect 429s in the histogram.
5. First deploy only: `SEED_OWNER_USERNAME=… SEED_OWNER_PASSWORD=… npm run seed:owner --workspace @rental/api`
   from the API container. The script prints `seed.owner` with the outcome and never the
   password. Hand the credentials to the Owner over the agreed channel and ask them to reset it
   from `/employees` after the first sign-in.

## Rollback

1. Decide within 15 minutes of a failed smoke or an alert (5xx rate, readiness flapping,
   p95 over budget, or a business defect the Owner reports).
2. Redeploy the previous API image and admin bundle. Because migrations are additive, the
   previous version runs on the new schema; do not roll the database back.
3. If data was written by a defect, restore from the pre-deploy dump only when the Owner agrees
   to lose the writes made since; otherwise fix forward with a hot patch.
4. Confirm readiness, repeat the smoke, and log the incident (`incident-response.md`).

## Evidence to keep

Release record with: commit, image tags, backup file, migration list, readiness output,
smoke-load summary line, name of the person who signed off.
