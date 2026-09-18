# Release Checklist — Go-live

**Sprint:** 7 (Hardening, UAT and Go-live) · **Prepared:** 2026-09-18  
**Rule:** every box in sections A–C is ticked with evidence before the Product Owner signs D.
Items marked *infra* need the hosting/edge provider the client selects; they cannot be
evidenced from the repository alone.

## A. Application gates (evidenced in this repository)

- [x] Global request throttling (read 120/min, mutation 30/min, login 20/min per IP with
      5-failure lockout, export 5/10 min) with `429`, `Retry-After` and security events —
      `tests/api/hardening.test.ts`.
- [x] Body size limit (`BODY_LIMIT`, default 256 kB) answers a normalized `413` without echoing
      the payload.
- [x] Hardened headers (helmet CSP/HSTS/nosniff/referrer policy), no `x-powered-by`, trusted
      proxy hops configurable, `x-request-id` on every response.
- [x] Liveness `/api/health` and readiness `/api/health/ready` (database probe, 503 when down).
- [x] Structured JSON logs with redaction of credentials, cookies and tokens; 5xx logged with
      request id; security events for rate limits.
- [x] Production startup refuses missing secrets, wildcard CORS, demo mode or disabled limits.
- [x] Owner audit log API and page with filters, newest first, page size ≤ 200; price
      overrides show reason, old and new price.
- [x] Employee management (US-006): create, lock (sessions revoked), unlock, reset password,
      self-lock refused; all audited.
- [x] Seed script creates one Owner idempotently; demo namespace never mounts in production.
- [x] Backup, restore, restore-drill and backup-age scripts with restore verification
      (`verify:restore`) — `app/ops/backup/*`, `apps/api/src/cli/verify-restore*.ts`.
- [x] Read-only load smoke script — `app/ops/load/smoke-load.mjs`.
- [x] Accessibility sweep: axe WCAG 2.2 AA (no serious/critical), one `h1`, no horizontal
      overflow at 360 px and 1280 px on the login page and every workspace route.
- [x] Vietnamese/English dictionaries in parity (keys and placeholders).
- [x] CI: production dependency audit (no high/critical), format, lint, typecheck, coverage
      ≥ 80 %, build, Playwright.
- [x] Runbooks: backup/restore, deploy/rollback, monitoring/alerts, incident response.
- [x] Operator guide and training exercises (Vietnamese) — `operator-guide.md`.

## B. Infrastructure gates (*infra*, to be evidenced on the chosen provider)

- [ ] Managed Postgres with encrypted volumes and automated snapshots in addition to the daily
      dump; off-site copy of dumps with its own retention.
- [ ] Edge DDoS/WAF in front of the API; origin unreachable from the public Internet;
      `TRUST_PROXY_HOPS` set to the real proxy count.
- [ ] TLS certificates and HSTS preload decision.
- [ ] Shared throttle store (Redis) before running more than one API replica; a single replica
      is approved for MVP with the in-memory counter.
- [ ] Phase 2: `PRIVATE_FILE_DIR` on a persistent volume outside the web root, included in the
      daily backup and the restore drill; an S3-compatible adapter behind the same
      `PrivateFileStore` port before running more than one API replica (PD-17).
- [ ] Log shipping and the alert rules in `ops/runbooks/monitoring-alerts.md` configured;
      backup-age and restore-drill alerts observed firing once on purpose.
- [ ] Restore drill executed on the provider with the production-sized dump within the
      60-minute RTO; verdict PASS attached.
- [ ] Load test on staging with raised limits: p95 under 500 ms at 20 concurrent readers;
      limits fail safely (429, API stays up) at default values.
- [ ] Secrets in the provider's secret manager; migration identity separate from the runtime
      database role.

## C. Data and people

- [ ] Product Owner confirms PD-06, PD-12, PD-13 and PD-14 (see `project-context.md`); for
      the Phase 2 release also PD-16 and PD-17.
- [ ] Decision on PD-08 (import of the legacy Excel data) recorded; if yes, the import runs on
      staging first and is verified against the workbook totals.
- [ ] First Owner created with `seed:owner`; the Owner changed the password on first sign-in.
- [ ] Staff accounts created from `/employees`; each person completed the training exercises
      for their role in `operator-guide.md` (eleven in the Sprint 13 version).
- [ ] Incident owner, alert channel and business contact named in the private operations sheet.

## D. Sign-off

| Gate | Evidence | Signed by | Date |
|---|---|---|---|
| Code review LGTM | `.project/reviews/sprint-7-code-review.md` | google-code-reviewer | 2026-09-18 |
| QA PASS | `.project/state/specialists/google-qa-engineer-sprint-7.md` | google-qa-engineer | 2026-09-18 |
| Witnessed Browser Acceptance Test | Product Owner session on staging | | |
| Restore drill on provider | `restore.verify` line | | |
| Go-live approval | | Product Owner | |

## Rollback plan (summary)

Previous image tag recorded before deploy; migrations are additive so the previous API runs on
the new schema; rollback = redeploy previous API and admin bundle, confirm readiness, repeat the
smoke. Database restore only with the Owner's agreement to lose post-dump writes. Full steps in
`app/ops/runbooks/deploy-rollback.md`.
