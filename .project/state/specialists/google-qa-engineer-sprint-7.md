# Specialist Task State — google-qa-engineer Sprint 7

**Status:** COMPLETE
**Date:** 2026-09-18
**Skills Used:** google-qa-engineer, qa-testing, bdd, playwright, axe-core, vitest

## Scenario coverage

`.project/scenarios/sprint-7/release-hardening.feature` — 13 scenarios (one outline with four
examples); `.project/scenarios/sprint-7/employee-management.feature` — 8 scenarios (one
outline with four examples).

| Scenario | Evidence |
|---|---|
| Abusive read traffic is throttled per session and per client | `tests/api/hardening.test.ts`: 3 reads pass, 4th → 429 with `Retry-After`, `x-ratelimit-remaining: 0`, another session and `/api/health` unaffected, `REQUEST_RATE_LIMITED` event keyed `session:<16 hex>`, recovery after the window; `tests/domain/hardening-policies.test.ts` sliding window |
| Mutations and exports have tighter policies than reads | API: 2 mutations then 429 while reads continue; export 1 then 429 while the report stays 200; login 2 then 429 before credentials are checked |
| Oversized request bodies are refused before validation | API: 2 kB login body with `BODY_LIMIT=1kb` → 413 `PAYLOAD_TOO_LARGE`, request id, payload not echoed |
| Every response carries the hardened header set | API: CSP, HSTS, nosniff, referrer policy, no `x-powered-by`, `x-request-id` |
| Readiness reflects the database while liveness stays cheap | API: `/api/health` and `/api/health/ready` (`demo`, version); domain: up / down / timed-out probes, `unavailable` only when down |
| Requests are logged as structured JSON with redaction | API: login, read (actor `demo-staff`, request id equals the header) and 404 (`warn`) lines; no password, cookie or session token in the sink; domain redaction to depth 4 |
| Owner reviews sensitive changes in the audit log | `tests/api/employees-audit.test.ts`: `PRICE_OVERRIDDEN` shows actor name, ISO time, reason, before 650 000, after 600 000; newest first; `limit=1`; `limit=500` and a malformed date → 400; Staff → 403 |
| Daily backup is restored into a scratch database and verified | `app/ops/backup/*.sh` reviewed; `tests/domain/backup-age.test.ts` covers the alert hook (missing, stale, fresh) |
| Restore verification reconciles the ledger (outline ×4) | Domain: 12/30/3/0 PASS, 12/30/3/1 FAIL, 0/0/0/0 FAIL, 5/0/1/0 PASS; issues list for missing migration, orphan payment and negative ledger |
| Deploy and rollback follow the runbook | `app/ops/runbooks/deploy-rollback.md` reviewed against the checklist |
| Production starts with one Owner account and no demo data | Domain: seed creates once with an argon2 hash and reports `exists` on the second run; short password refused; environment policy refuses disabled limits in production |
| Vietnamese and English translation trees stay in parity | `tests/admin/i18n-parity.test.ts`: identical key sets, no empty leaf, identical placeholders |
| Every workspace page passes the accessibility and overflow sweep | `e2e/release-accessibility.spec.ts`: 12 routes × 2 viewports (360/1280): axe WCAG 2.2 AA no serious/critical, one `h1`, no horizontal overflow — 24/24 |
| Dependency audit and browser gates run in CI | `.github/workflows/ci.yml`: audit, format, lint, typecheck, coverage, build, Playwright job; `npm audit` 0 vulnerabilities locally |
| Only the Owner manages employees | API: Staff → 403 on list, create, status, password and audit |
| Owner creates a Staff account | API: 201 active STAFF, no hash in the body, list count 3, `EMPLOYEE_CREATED` with actor "Chủ cửa hàng", new user signs in, duplicate → 409 |
| Employee input is validated (outline ×4) | Domain `createEmployeeInputSchema`; API `nv` and `short` → 400; admin `employeeFieldIssues` |
| Locking an employee ends their sessions but keeps their history | API: session → 401, login → "Tài khoản hiện không thể truy cập", ledger keeps "Nguyễn Thị Lan", `EMPLOYEE_LOCKED` |
| Owner unlocks an employee | API: sign-in works again, `EMPLOYEE_UNLOCKED` count 1 |
| Owner resets an employee password | API: old password 401, session 401, new password signs in, audit without the password, unknown id → 404 |
| The Owner cannot lock their own account | API: 409 "tự khóa", Owner stays active; admin disables the button for self |
| Owner manages employees from the workspace | `e2e/employee-audit.spec.ts`: add `nv.e2e…` → "Đang làm" → lock → "Đã khóa" and "Mở khóa"; `/audit` shows `EMPLOYEE_LOCKED` by "Chủ cửa hàng" with the username; entity filter shows only "Tài khoản" |

## Regression and side effects

- The global throttle guard runs on every route; the existing auth policy test (six failed
  logins → `LOGIN_RATE_LIMITED`) still passes because the login policy is 20/min per IP while
  the account lockout fires at 5 failures. The Playwright API server runs with raised
  `RATE_LIMIT_*` values so 65 parallel browser tests never trip the read limit.
- Tests boot the API with a silent log sink unless they inject one; no JSON lines leak into
  the Vitest output.
- `text-brand` became `text-brand-ink` on soft backgrounds and the active navigation link is
  darker; Sprint 1–6 admin tests do not assert colour classes and pass unchanged.
- Scrollable table containers are focusable regions; keyboard order on the report page gains
  three tab stops (one per table).
- `/employees` and `/audit` replace the Sprint 1 employee preview; the navigation journey
  asserts the "Nhân viên" and "Nhật ký" headings and the Staff scenario covers `/audit` in
  its Owner-only route loop.
- Playwright per-test budget is 90 s to absorb cold Vite navigations under four workers;
  `expect` timeouts are unchanged (5 s).

## Final verification

- Format, lint, strict typecheck (contracts + api + admin): pass.
- Unit/integration suite: 239/239 pass (38 files: domain 9, API 9, infrastructure 6, admin 11,
  contracts/security/others).
- Coverage: 95.69 % statements, 84.02 % branches, 95.56 % functions and 96.61 % lines
  (threshold 80 %).
- Browser acceptance and regression: 65/65 pass in Chromium with timezone Asia/Ho_Chi_Minh
  (lifecycle, return, finance, employee/audit and the 24 accessibility checks).
- Production build, `prisma validate` and `npm audit` (0 vulnerabilities): pass.
- Not executed in this environment (infrastructure): the restore drill against a real
  PostgreSQL server, the staging load run and the witnessed Browser Acceptance Test with the
  Product Owner; all three are open items in `release-checklist.md`.
