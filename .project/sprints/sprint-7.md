# Sprint 7: Hardening, UAT and Go-live

**Sprint:** 7 of 8  
**Duration:** 2 weeks  
**Goal:** Chứng minh hệ thống an toàn, khôi phục được và sẵn sàng dùng thật.  
**Status:** COMPLETE — QA PASS (application scope); infrastructure go-live gates open in `release-checklist.md`

## Task Details

### Task 7.S: Release and UAT scenarios [QA]
**Status:** [COMPLETE]
**Story Points:** 5  
**Wireframe:** `11-employees-audit.md`, all approved product wireframes

**Deliverables:** 13 release scenarios in `.project/scenarios/sprint-7/release-hardening.feature` (throttling, body limits, headers, readiness, logging, audit log, backup/restore drill and verification outline, rollback, Owner seed, i18n parity, accessibility sweep, CI) and 8 employee scenarios in `employee-management.feature` (US-006, pulled in as PD-14).  
**Acceptance Criteria:** Data, devices, roles and expected evidence are explicit; every scenario maps to a test or a runbook step.

### Task 7.1: Security and performance hardening [Security/Backend]
**Status:** [COMPLETE]
**Story Points:** 8  
**Wireframe:** -

**Deliverables:** Global sliding-window throttling (read/mutation/login/export) with 429 + Retry-After and security events, `BODY_LIMIT` with normalized 413/415, helmet headers, no `x-powered-by`, trusted proxy hops, `x-request-id`, production policy refusing disabled limits, dependency audit at 0 vulnerabilities, read-only load smoke script.  
**Acceptance Criteria:** No open Critical/High issue; limits fail safely in tests; staging load run recorded as an *infra* gate.

### Task 7.2: Backup, restore and observability [DevOps]
**Status:** [COMPLETE]
**Story Points:** 8  
**Wireframe:** -

**Deliverables:** `backup.sh`, `restore.sh`, `restore-drill.sh`, `check-backup-age.mjs`, `verify:restore` CLI (counts, active Owner, orphans, negative ledgers, settlement vs ledger, migrations), structured JSON logs with redaction, readiness probe, Owner audit log API + page, four runbooks (backup/restore, deploy/rollback, monitoring/alerts, incident response).  
**Acceptance Criteria:** Restore verification verdict and alert hook tested; the provider drill within RPO 24 h / RTO 60 min is tracked in the release checklist.

### Task 7.3: Responsive, i18n and accessibility polish [Frontend]
**Status:** [COMPLETE]
**Story Points:** 8  
**Wireframe:** All approved product wireframes

**Deliverables:** axe WCAG 2.2 AA sweep on the login page and 11 workspace routes at 360 px and 1280 px (24 checks), brand-ink contrast token, focusable scrollable tables, single `h1` and no-overflow assertions, vi/en dictionary parity gate.  
**Acceptance Criteria:** No serious/critical accessibility or overflow issue in Chromium.

### Task 7.4: Initial data, documentation and training [BA/DevOps]
**Status:** [COMPLETE]
**Story Points:** 5  
**Wireframe:** `11-employees-audit.md`

**Deliverables:** Idempotent Owner seed (`seed:owner`), employee management screen (US-006), Vietnamese operator guide with six training exercises, release checklist with rollback summary, `.env.example` keys.  
**Acceptance Criteria:** Owner/Staff can complete representative tasks using the guide; PD-08 (legacy import) remains a Product Owner decision.

### Task 7.R: Final code and release review [Code Review]
**Status:** [COMPLETE — LGTM]
**Story Points:** 5  
**Wireframe:** -

**Deliverables:** `.project/reviews/sprint-7-code-review.md` (CR-7-01 … CR-7-08).  
**Acceptance Criteria:** LGTM after five blocking fixes; no unresolved release blocker in the repository.

### Task 7.Q: Final QA and browser acceptance [QA]
**Status:** [COMPLETE — PASS]
**Story Points:** 8  
**Wireframe:** All approved product wireframes

**Deliverables:** 239 unit/integration tests, 65 browser tests, coverage above 80 % on every dimension, `google-qa-engineer-sprint-7.md`.  
**Acceptance Criteria:** All stories pass in automation; the witnessed Browser Acceptance Test with the Product Owner is scheduled on staging (release checklist D).

## Sprint Backlog

| ID | Task | Points | Status | Assignee | Wireframe |
|----|------|--------|--------|----------|-----------|
| 7.S | Release/UAT scenarios | 5 | [COMPLETE] | QA | `11-employees-audit.md` |
| 7.1 | Security/performance hardening | 8 | [COMPLETE] | Security/Backend | - |
| 7.2 | Backup/restore/observability | 8 | [COMPLETE] | DevOps | - |
| 7.3 | Responsive/i18n/accessibility polish | 8 | [COMPLETE] | Frontend | All approved wireframes |
| 7.4 | Initial data/docs/training | 5 | [COMPLETE] | BA/DevOps | `11-employees-audit.md` |
| 7.R | Final code/release review | 5 | [COMPLETE — LGTM] | Code Review | - |
| 7.Q | Final QA/browser acceptance | 8 | [COMPLETE — PASS] | QA | - |

## Sprint Summary

**Total:** 7 tasks · 47 points · all complete on 2026-09-18.

QA evidence: 239 unit/integration tests and 65 browser journeys passed. Coverage reached
95.69% statements, 84.02% branches, 95.56% functions and 96.61% lines. Format, lint, strict
typecheck, production build, Prisma schema validation and dependency audit passed.

## Definition of Done

- [x] Security, performance, backup/restore and rollback gates pass in the repository; the
      provider-side drill, WAF and load run are open *infra* items in `release-checklist.md`.
- [x] Full regression and automated UAT pass; the witnessed Browser Acceptance Test awaits the
      Product Owner session on staging.
- [x] Code review LGTM, QA approved; the CEO release checklist is prepared for sign-off.

## Dependencies and Risks

- Depends on all prior sprints and the production hosting/edge provider selection (still
  open).
- PD-14: US-006 employee management was not assigned to any sprint and was delivered here as a
  go-live prerequisite; Product Owner confirmation requested.
- PD-08: legacy Excel import is not included; the decision remains with the Product Owner.
- The in-memory throttle store is valid for one API replica only.
