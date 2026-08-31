# Sprint 1: UI Foundation and Product Preview

**Sprint:** 1 of 8  
**Duration:** 2 weeks after Gate 1 approval  
**Goal:** Người dùng đăng nhập vào một web app responsive và xem được dashboard cùng các màn hình module chính bằng dữ liệu demo có nhãn.  
**Status:** COMPLETE — QA PASS

## Task Details

### Task 1.S: Sprint 1 BDD Scenarios [QA]
**Status:** [COMPLETE]  
**Story Points:** 5  
**Wireframe:** -

**Deliverables:**
- [x] `.project/scenarios/sprint-1/ui-foundation.feature`
- [x] Test skeletons under `app/tests/` and `app/e2e/`

**Acceptance Criteria:**
- [x] Covers US-001 through US-005.
- [x] User approves scenarios before any dev task starts.

### Task 1.1: Workspace and API Platform Scaffold [Backend #1]
**Status:** [COMPLETE]  
**Story Points:** 5  
**Wireframe:** -

**Deliverables:**
- [x] Workspace, NestJS API and shared tooling under `app/`.
- [x] Global Helmet, validated CORS, ValidationPipe, normalized errors/request IDs and throttler foundation.
- [x] Lint, typecheck, backend unit and Playwright setup.
- [x] CI workflow and environment contract.

**Acceptance Criteria:**
- [x] Build, lint and base tests pass.
- [x] No application/config file exists outside `app/`.
- [x] Unapproved origin, malformed DTO and excessive requests are rejected by integration tests.

### Task 1.2: Database, Session, Roles and Demo API [Backend #2]
**Status:** [COMPLETE]  
**Story Points:** 8  
**Wireframe:** `01-login.md`

**Deliverables:**
- [x] Secure session/auth foundation.
- [x] Owner/Staff access policy.
- [x] Prisma schema, typed API contracts, guarded demo endpoints, demo seed and security audit events.

**Acceptance Criteria:**
- [x] Locked staff cannot access protected routes.
- [x] Staff cannot access owner-only routes.
- [x] Production mode cannot silently use demo provider.
- [x] Login has account+IP abuse policy, generic failures, temporary lockout and session revocation.
- [x] Cookie-authenticated mutations enforce CSRF protection.

### Task 1.3: React SPA, Responsive Shell and Navigation [Frontend #1]
**Status:** [COMPLETE]  
**Story Points:** 8  
**Wireframe:** `02-app-shell.md`

**Deliverables:**
- [x] React/Vite SPA, React Router, desktop sidebar, mobile navigation and header.
- [x] Demo banner, page header and status badge primitives.

**Acceptance Criteria:**
- [x] Works at 360 px and desktop without horizontal overflow.
- [x] Navigation changes by role and has keyboard-visible focus.

### Task 1.4: Operations Dashboard Preview [Frontend #2]
**Status:** [COMPLETE]  
**Story Points:** 8  
**Wireframe:** `03-dashboard.md`

**Deliverables:**
- [x] KPI cards and today/overdue lists.
- [x] Desktop/mobile, loading, empty and error states.

**Acceptance Criteria:**
- [x] Demo data is visibly labelled.
- [x] Operational priority is readable without relying only on color.

### Task 1.5: Module Preview Screens [Frontend #2]
**Status:** [COMPLETE]  
**Story Points:** 8  
**Wireframe:** `04-module-previews.md`

**Deliverables:**
- [x] Vehicles, customers, contracts, returns and reports previews.
- [x] Owner employee/settings previews.

**Acceptance Criteria:**
- [x] Each screen uses consistent table/card/filter patterns.
- [x] Unimplemented actions state the planned sprint instead of pretending success.

### Task 1.6: Localization and State Coverage [Frontend #1]
**Status:** [COMPLETE]  
**Story Points:** 5  
**Wireframe:** `05-states-and-access.md`

**Deliverables:**
- [x] Vietnamese/English dictionary and switch.
- [x] Empty/loading/error/access-denied states.

**Acceptance Criteria:**
- [x] Locale persists across navigation.
- [x] All Sprint 1 visible strings are translated.

### Task 1.R: Sprint 1 Code Review [Code Review]
**Status:** [COMPLETE — LGTM]  
**Story Points:** 3  
**Wireframe:** -

**Deliverables:**
- [x] Architecture, security, performance and design-system compliance review.

**Acceptance Criteria:**
- [x] LGTM after all findings are fixed.
- [x] `.project/documentation/security.md` controls are traced to implementation/tests or an explicit go-live item.

### Task 1.Q: Sprint 1 QA and Browser Acceptance [QA]
**Status:** [COMPLETE — PASS]  
**Story Points:** 8  
**Wireframe:** -

**Deliverables:**
- [x] Full test and coverage report.
- [x] Desktop/mobile Playwright acceptance report.
- [x] Preview/staging smoke test.

**Acceptance Criteria:**
- [x] BDD tests and regression green.
- [x] Coverage target at least 80% for implemented logic.
- [x] No Critical/High accessibility or authorization issue.

## Sprint Backlog

| ID | Task | Points | Status | Assignee | Wireframe |
|----|------|--------|--------|----------|-----------|
| 1.S | Sprint 1 BDD scenarios | 5 | [COMPLETE] | QA | - |
| 1.1 | NestJS workspace, API platform and security scaffold | 5 | [COMPLETE] | Backend #1 | - |
| 1.2 | Database, session, roles and demo API | 8 | [COMPLETE] | Backend #2 | 01-login.md |
| 1.3 | React SPA, responsive shell and navigation | 8 | [COMPLETE] | Frontend #1 | 02-app-shell.md |
| 1.4 | Operations dashboard preview | 8 | [COMPLETE] | Frontend #2 | 03-dashboard.md |
| 1.5 | Module preview screens | 8 | [COMPLETE] | Frontend #2 | 04-module-previews.md |
| 1.6 | Localization and state coverage | 5 | [COMPLETE] | Frontend #1 | 05-states-and-access.md |
| 1.R | Sprint 1 code review | 3 | [COMPLETE — LGTM] | Code Review | - |
| 1.Q | Sprint 1 QA and browser acceptance | 8 | [COMPLETE — PASS] | QA | - |

## Sprint Summary

| Metric | Value |
|---|---:|
| Total Tasks | 9 |
| Story Points | 58 |
| Status | Complete — 58/58 points |

## Definition of Done

### Functional Criteria
- [x] Owner and Staff can log in with approved demo accounts.
- [x] Role-aware responsive navigation works.
- [x] Dashboard and module previews render with clearly labelled demo data.
- [x] Vietnamese/English and all required UI states work.

### Technical Criteria
- [x] All Sprint 1 tasks complete.
- [x] Build, lint and typecheck pass.
- [x] BDD, unit, integration and E2E tests green.
- [x] Code review LGTM.

### Quality Criteria
- [x] No horizontal overflow at 360 px.
- [x] Keyboard focus and contrast meet agreed design system.
- [x] Demo provider cannot leak into production silently.
- [x] Rate limit, authorization, validation, CORS/CSRF and log-redaction tests pass.
- [x] Production DDoS/WAF/origin controls are documented as infrastructure gates, not claimed as NestJS-only protection.
- [x] Browser Acceptance Test passes for Owner and Staff.

## Dependencies

| Dependency | Reason | Status |
|---|---|---|
| Sprint 0 Gate 1 → Task 1.S | Scenarios require approved requirements/design | Complete |
| Task 1.S → Task 1.1 | BDD contract precedes implementation | Complete; ready |
| Task 1.1 → Task 1.2 | Backend #2 integrates after API scaffold | Complete |
| Task 1.2 → Task 1.3 | Frontend #1 needs auth/API contracts | Complete |
| Task 1.3 → Tasks 1.4–1.5 | Frontend #2 consumes approved shared UI primitives | Complete |
| Tasks 1.1–1.6 → Task 1.R | Review after development | Complete |
| Task 1.R → Task 1.Q | QA after review fixes | Complete |

## Risks & Blockers

| # | Type | Description | Impact | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|
| 1 | Blocker | Gate 1 and BDD approval | High | Approved and closed | PM | Closed |
| 2 | Risk | Demo UI mistaken for finished business logic | Medium | Persistent demo banner and disabled/unimplemented CTA copy | Frontend | Closed |
| 3 | Security | Local throttle counters do not coordinate across replicas | High at scale | Shared store/managed edge limiter required before multi-replica production | Backend #1/DevOps | Open |

## Notes

- Sprint 1 deliberately optimizes for early UI feedback.
- Delivery allocation is two backend and two frontend workstreams, executed sequentially in Codex.
- Sprint 2+ remains paused after Sprint 1 until the client explicitly continues.
- Backend security baseline is part of Sprint 1, while managed DDoS/WAF activation is verified again at go-live.

## Sprint Retrospective

- BDD-first security scenarios exposed authorization, demo-separation and session-revocation gaps early.
- Running Prettier before final sign-off exposed compressed components that exceeded the real function-size limit; they were split without suppressions.
- Final result: 21 unit/integration tests, 10 browser tests, four coverage metrics above 80%, review LGTM and QA PASS.
- Sprint 2 remains paused until the Product Owner reviews this Sprint 1 UI.
