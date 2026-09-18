# Sprint 7 Exact File Blueprint — Hardening, UAT and Go-live

**Status:** APPROVED — reconciled with the Sprint 7 implementation on 2026-09-18 (after code review)
**Architecture:** Harden the approved modular NestJS + React SPA monolith without adding a
service boundary or a persistence technology. Abuse control, structured logging, readiness
and the Owner audit query are cross-cutting NestJS modules under `common/`; employee account
management (US-006, pulled into Sprint 7 as a go-live prerequisite, PD-14) is a thin Owner-only
module over the existing account and session ports. Backup, restore, seed and load tooling
are plain scripts under `app/ops/` and `apps/api/src/cli/` so they run on any host with
`pg_dump`, `psql` and Node. Edge WAF, managed Postgres and hosting remain infrastructure
go-live gates recorded in `release-checklist.md`.

## Shared contracts

```text
app/packages/contracts/src/
├── employees.ts                            # usernameSchema, passwordSchema (10–200), Employee, EmployeeList, create/status/reset inputs
├── audit.ts                                # AuditEventView, AuditList, auditQuerySchema (action, actorId, entityId, entityType, from, to, limit ≤ 200)
└── index.ts                                # Public exports
```

## Backend — configuration, transport hardening and logging

```text
app/apps/api/src/
├── main.ts                                 # bodyParser off → hardenTransport: trust proxy, no x-powered-by, request log, helmet, JSON/urlencoded limits, cookies, CORS; silent sink in test
├── app.module.ts                           # forRoot(environment, logSink?) wires Logging, Throttle, Health, AuditQuery and Employee modules
├── config/environment.ts                   # APP_VERSION, BODY_LIMIT, RATE_LIMIT_* (enabled/read/mutation/login/export), TRUST_PROXY_HOPS; production refuses disabled limits
├── common/logging/
│   ├── structured-logger.ts                # LOG_SINK, redact() (authorization/cookie/csrf/hash/password/secret/token), JSON line sinks
│   ├── request-log.middleware.ts           # x-request-id + one http.request line (route template, status, duration, actor, client IP)
│   └── logging.module.ts                   # Global LoggingModule.register(sink)
├── common/throttle/
│   ├── throttle.policy.ts                  # Sliding-window counter, policy table (read/mutation/login/export), policyNameFor
│   ├── throttle.decorator.ts               # @ThrottlePolicy('login' | 'export')
│   ├── request-throttle.service.ts         # check(policy, subject) → allowed/limit/remaining/retryAfter; records REQUEST_RATE_LIMITED
│   └── throttle.module.ts                  # Global module registering the APP_GUARD
├── common/guards/request-throttle.guard.ts # Subject = session hash prefix or client IP; 429 + Retry-After + x-ratelimit-* headers
├── common/filters/api-exception.filter.ts  # Parser errors (413/415) normalized; 429 → TOO_MANY_REQUESTS; 5xx logged with request id
├── common/interceptors/request-context.interceptor.ts # Reuses the middleware request id
└── modules/auth/security-event.service.ts  # LOGIN_RATE_LIMITED / REQUEST_RATE_LIMITED events written as security.event log lines
```

## Backend — readiness, audit query and employee management

```text
app/apps/api/src/
├── modules/health/
│   ├── database.probe.ts                   # DATABASE_PROBE port, demo/Prisma probes, SELECT 1 with 2 s timeout
│   ├── health.service.ts                   # getStatus (liveness) and getReadiness (database check, uptime, version)
│   ├── health.controller.ts                # GET /api/health, GET /api/health/ready (503 when unavailable)
│   └── health.module.ts                    # HealthModule.register(environment)
├── common/audit/
│   ├── audit.types.ts                      # AuditFilter and repository query(filter)
│   ├── audit.service.ts                    # query(filter)
│   ├── demo-audit.repository.ts            # matchesAuditFilter, newest-first in-memory query
│   └── prisma-audit.repository.ts          # auditWhere(filter), findMany newest first with take
├── modules/audit/
│   ├── audit-query.policy.ts               # auditFilterFrom: business-day bounds in Asia/Ho_Chi_Minh
│   ├── audit-query.service.ts              # AuditList with actor names from the employee directory
│   ├── audit.controller.ts                 # GET /api/audit (Owner only, auditQuerySchema)
│   └── audit-query.module.ts
├── modules/employees/
│   ├── employee.service.ts                 # list, create (409 duplicate, argon2), setActive (self-lock 409, sessions revoked), resetPassword; audit EMPLOYEE_*
│   ├── employee.controller.ts              # GET/POST /api/employees, PATCH :id/status, POST :id/password (Owner + CSRF)
│   └── employee.module.ts
├── modules/auth/
│   ├── auth.types.ts                       # AccountRepository create/list/updatePasswordHash; SessionRepository deleteByAccountId
│   ├── auth.repository.ts                  # createAccount, listAccounts, updatePasswordHash, deleteSessionsForAccount
│   ├── demo-account.repository.ts          # In-memory account writes
│   ├── prisma-account.repository.ts        # Prisma account writes; P2002 → CONFLICT
│   ├── memory-session.repository.ts        # deleteByAccountId
│   └── prisma-session.repository.ts        # deleteMany by accountId
└── cli/
    ├── seed-owner.ts / seed-owner.main.ts  # Idempotent first Owner from SEED_OWNER_* (password never printed)
    └── verify-restore.ts / verify-restore.main.ts # Restore verdict: counts, active Owner, orphans, negative ledgers, settlement vs ledger, migrations
```

## Operations tooling

```text
app/ops/
├── README.md                               # How the scripts fit the runbooks
├── backup/backup.sh                        # pg_dump custom format + gzip + sha256, retention
├── backup/restore.sh                       # Checksum verify + pg_restore --clean --if-exists
├── backup/restore-drill.sh                 # Latest dump → scratch database → npm run verify:restore
├── backup/check-backup-age.mjs             # Alert hook: newest dump older than N hours → exit 1
├── load/smoke-load.mjs                     # Read-only load smoke with p50/p95 and status histogram
└── runbooks/                               # backup-restore, deploy-rollback, monitoring-alerts, incident-response
```

## Frontend — employees, audit log and accessibility

```text
app/apps/admin/src/
├── App.tsx                                 # Owner routes /employees and /audit replace the Sprint 1 preview
├── shared/navigation/routes.ts             # "Nhật ký" navigation item (Owner only)
├── shared/i18n/i18n.ts                     # Employee/audit dictionaries; preview keys removed
├── styles.css                              # --color-brand-ink token; active navigation uses the pressed brand colour (4.5:1)
├── components/ui/table-root.tsx            # Scrollable table container is a focusable region
├── features/employees/
│   ├── api/employee-api.ts                 # fetch/create/status/reset calls
│   ├── hooks/use-employees.ts              # Query + mutations with invalidation
│   ├── hooks/use-employee-page.ts          # Dialog state, self detection, toggle
│   ├── hooks/use-employee-form.ts          # Create form state and touched-field issues
│   ├── hooks/use-password-reset-form.ts
│   ├── lib/employee-presentation.ts        # username/password issue keys, badge tone
│   ├── lib/employee-translations.ts        # vi/en copy
│   ├── components/list/*                   # Header, list, table row, card, status badge, toggle button, actions
│   ├── components/form/*                   # Dialog shell, identity fields, password field, create/reset forms and dialogs
│   ├── pages/EmployeeListPage.tsx
│   └── index.ts
└── features/audit/
    ├── api/audit-api.ts                    # auditSearchParams, fetchAuditEvents
    ├── hooks/use-audit-events.ts, hooks/use-audit-page.ts
    ├── lib/audit-presentation.ts           # Entity/action lists, auditQueryFrom, metadataRows (money as VND), actionTone
    ├── lib/audit-translations.ts
    ├── components/*                        # Header, select/date filters, timeline, entry, metadata
    ├── pages/AuditLogPage.tsx
    └── index.ts
```

## Tests, browser gates and CI

```text
app/tests/domain/hardening-policies.test.ts     # Sliding window, policy table, redaction, readiness, restore outline, seed, employee validation
app/tests/domain/backup-age.test.ts             # Backup age alert hook
app/tests/api/hardening.test.ts                 # Headers, request id, 413, read/mutation/export/login throttling, readiness, log lines
app/tests/api/employees-audit.test.ts           # US-006 and audit log scenarios end to end over HTTP
app/tests/infrastructure/prisma-sprint7.repositories.test.ts # Account create/list/reset, session revoke, audit query adapter
app/tests/admin/i18n-parity.test.ts             # vi/en key and placeholder parity
app/tests/admin/employee-audit-presentation.test.ts
app/e2e/employee-audit.spec.ts                  # Owner creates and locks an employee, reads the audit log
app/e2e/release-accessibility.spec.ts           # axe WCAG 2.2 AA sweep, single h1, no overflow at 360/1280 on every route
app/playwright.config.ts                        # 90 s test budget; API web server runs with raised RATE_LIMIT_* values
app/.github/workflows/ci.yml                    # audit --omit=dev, format, lint, typecheck, coverage, build, then Playwright job
```

## Environment keys added

`APP_VERSION`, `BODY_LIMIT`, `RATE_LIMIT_ENABLED`, `RATE_LIMIT_READ_PER_MINUTE`,
`RATE_LIMIT_MUTATION_PER_MINUTE`, `RATE_LIMIT_LOGIN_PER_MINUTE`,
`RATE_LIMIT_EXPORT_PER_TEN_MINUTES`, `TRUST_PROXY_HOPS`, `SEED_OWNER_USERNAME`,
`SEED_OWNER_PASSWORD`, `SEED_OWNER_NAME` (see `app/.env.example`).
