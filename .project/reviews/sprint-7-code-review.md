# Sprint 7 Hardening, UAT and Go-live — Code Review

**Reviewer:** google-code-reviewer  
**Date:** 2026-09-18  
**Initial verdict:** NEEDS MINOR  
**Re-review verdict:** LGTM

## Measurement Pass

- **M1 — file length:** 96 changed or new files under `app/` (TypeScript/TSX/YAML/shell/mjs).
  No TypeScript file exceeds the 300-line gate. Largest new production files:
  `environment.ts` 118, `api-exception.filter.ts` 121, `verify-restore.main.ts` 96,
  `employee.service.ts` 94, `request-throttle.guard.ts` 63.
- **M2 — function length:** the 30-line gate passes for every production file. Four admin
  components and three API functions were split during the review to get there (CR-7-01,
  CR-7-02).
- **M3 — duplicate scan:** rate-limit policy math has one home (`throttle.policy.ts`),
  redaction one home (`structured-logger.ts`), username/password rules one home
  (`@rental/contracts/employees.ts`, reused by the API pipe, the CLI seed and the admin form),
  audit day bounds one home (`audit-query.policy.ts`), and the restore verdict one home
  (`verify-restore.ts`) shared by the CLI and the domain tests.
- **M4 — drift:** the Sprint 1 `EmployeePreview`, the shared `PreviewPage`/`use-preview`
  and the `preview*` dictionary keys were deleted; `04-module-previews.md` marks the employees
  preview as superseded; the audit scenario was reconciled to Owner-only price overrides.
- **M5 — installed gates:** `max-lines`, `max-lines-per-function`, `complexity`,
  `no-magic-numbers`, `naming-convention`, `react/no-multi-comp`, the relative-import ban, the
  frontend architecture Vitest gate and the new i18n parity test all run and pass. CI now also
  runs the production dependency audit, the format check and the Playwright job.

## Findings

### CR-7-01 — Admin components exceeded the function-length gate (blocking)

**Severity:** 🟠 Major  
`AuditFilters` (52 lines), `EmployeeFields` (39) and `EmployeeActions` (31, then 35 after the
first fix) exceeded the 30-line gate.
**Resolution:** extracted `AuditSelectFilters`, `AuditDateFilters`, `EmployeeIdentityFields`
and `EmployeeToggleButton`, one component per file. Lint passes with zero warnings.

### CR-7-02 — API helpers failed the complexity and length gates (blocking)

**Severity:** 🟡 Medium  
`matchesAuditFilter` had cyclomatic complexity 12, the restore `snapshot` reached 42 lines,
and the parser-error check compared numbers to the `HttpStatus` enum
(`no-unsafe-enum-comparison`).
**Resolution:** the audit filter iterates a table of exact-match fields plus a `withinRange`
helper; the snapshot is `rowCounts` + `consistency` merged; the client-error range is a named
constant. The audit API test still asserts `auditSearchParams` stringification, which also
moved to a typed `paramText` helper (`no-base-to-string`).

### CR-7-03 — Global throttle guard depended on the auth module (blocking)

**Severity:** 🟠 Major  
`RequestThrottleGuard` injected `AuthCookieService` and `AuthTokenService`; as an `APP_GUARD`
provided by the global `ThrottleModule` it could not resolve them, and the API failed to boot
(the Vitest worker died with Nest's initialization error because `abortOnError` defaulted to
true).
**Resolution:** the guard reads the cookie name from `ENVIRONMENT` and hashes the session token
itself (sha256, 16-character prefix); `NestFactory.create` now passes `abortOnError: false` so
a wiring error surfaces as a test failure instead of a dead worker.

### CR-7-04 — Accessibility sweep found real contrast and keyboard defects (blocking)

**Severity:** 🟠 Major  
axe reported `color-contrast` on the active navigation link and every `bg-brand-soft`
badge (brand `#6d5dd3` on `#eeeafe` is 4.29:1) on 20 of 24 route/viewport checks, and
`scrollable-region-focusable` on the report tables at 360 px.
**Resolution:** a `--color-brand-ink` token (pressed brand, 6.9:1 on the soft background)
replaces `text-brand` everywhere text sits on the soft tint, and `.nav-link.active` uses the
pressed colour; the shadcn table container is a focusable `region`. The sweep is 24/24.

### CR-7-05 — Browser suite timed out on cold Vite navigations (blocking)

**Severity:** 🟡 Medium  
With four workers and a cold Vite cache, `page.goto` on new routes exceeded the 30-second
default; the employee scenario also matched five "Mật khẩu" labels (the reset buttons carry
"Đặt lại mật khẩu <username>") and the navigation scenario hit two "Công nợ" headings once
another worker cleared the receivables.
**Resolution:** `timeout: 90_000` in `playwright.config.ts` with the reason recorded; exact
label matching; the employee scenario is one journey that ends with the entity-type filter.
Full suite 65/65.

### CR-7-06 — Login policy is 20/min per IP, not 5/min (non-blocking, documented)

**Severity:** 🟢 Minor  
The security plan lists 5 login attempts/minute. The account lockout (5 failures → 15 minutes)
already provides that per account; a 5/min IP policy would lock out a shop where several Staff
share one NAT address. The guard keys login on IP at 20/min and the plan notes the reason.

### CR-7-07 — In-memory throttle store (accepted for a single replica)

**Severity:** 🟢 Minor  
`SlidingWindowCounter` lives in process memory and prunes every 500 hits. Correct for the
approved single API replica; `release-checklist.md` and `security.md` gate a shared store
before scaling out.

### CR-7-08 — Admin bundle grew to 761 kB (non-blocking)

**Severity:** 🟢 Minor  
The employee and audit screens joined the single main chunk. Route-level code splitting stays
the carried-forward follow-up from CR-4-06 through CR-6-07; it is not a go-live blocker for a
two-role internal tool served from a CDN.

## Passed Areas

- **Abuse control:** four sliding-window policies with `429`, `Retry-After`,
  `x-ratelimit-limit/remaining`; subjects are `ip:<ip>` or `session:<hash prefix>`; disabled
  limits are refused in production; blocked requests emit `REQUEST_RATE_LIMITED` security
  events without the token.
- **Transport:** body parser off in Nest and re-attached with `BODY_LIMIT`; `413`/`415`
  normalized without echoing the payload; helmet headers, no `x-powered-by`, trusted proxy hops
  from configuration; `x-request-id` on every response and reused by the exception filter.
- **Logging:** one JSON line per request with route template, status, duration, actor and
  client IP; recursive redaction of credential-like keys to depth 4; 5xx logged with the stack
  server-side only; tests are silent by default and inject a sink when they assert lines.
- **Readiness:** `SELECT 1` through a port with a 2-second timeout; `503` when down; demo mode
  reports `demo`; liveness stays dependency-free.
- **Audit query:** Owner-only, strict query schema (limit ≤ 200), business-day bounds in
  Asia/Ho_Chi_Minh, newest first in both adapters, actor names resolved through the employee
  directory so locked accounts keep their name.
- **Employees (US-006):** argon2 hashes, duplicate → 409 (Prisma P2002 mapped), lock revokes
  every session and the login answers "Tài khoản hiện không thể truy cập", self-lock → 409,
  reset revokes sessions, every action audited with metadata that never includes a password.
- **Seed and restore:** the Owner seed is idempotent and never prints the password; the
  restore verdict checks counts, an active Owner, orphan payments, negative ledgers, settlement
  `paidVnd` against the ledger and applied migrations; the backup scripts verify checksums and
  restore into a scratch database only.
- **Frontend:** hooks own state and queries, one component per file, shadcn/Radix primitives
  only, dictionaries in parity, the Owner row cannot lock itself, and the audit page renders
  money metadata as VND.
- **Privacy:** fixtures use synthetic names (`Nguyễn Thị Lan`, `nv.e2e…`), logs are asserted
  free of passwords and cookies, and no private client workbook is referenced.
