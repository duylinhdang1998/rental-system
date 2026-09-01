# Sprint 8: Frontend Architecture Remediation

**Sprint:** 8 of 8
**Duration:** Remediation sprint
**Goal:** Align the implemented admin UI with the approved shadcn/Radix stack, feature
architecture and interaction standards before later business sprints continue.
**Status:** COMPLETE — CODE REVIEW LGTM · QA PASS

## Task Details

### Task 8.S: Frontend remediation BDD scenarios [QA]
**Status:** [COMPLETE]
**Estimated:** 2 hours | **Actual:** 1 hour
**Story Points:** 3
**Wireframe:** `06-fleet-customer-management.md`

**Deliverables:**
- [x] `.project/scenarios/sprint-8/frontend-architecture-remediation.feature`
- [x] `app/tests/admin/frontend-architecture.test.ts`
- [x] `app/e2e/frontend-remediation.spec.ts`

**Acceptance Criteria:**
- [x] [US-021] Scenarios cover primitives, structure, overlays, responsive actions and CreatedAt.
- [x] RED tests fail against the current implementation for the intended reasons.

**BDD Scenario:** `.project/scenarios/sprint-8/frontend-architecture-remediation.feature`

### Task 8.1: shadcn/Radix foundation and Inter [Frontend]
**Status:** [COMPLETE]
**Estimated:** 4 hours | **Actual:** 4 hours
**Story Points:** 5
**Wireframe:** `components.md`

**Deliverables:**
- [x] shadcn radix-nova registry and required UI primitives
- [x] Inter typography and semantic Soft Modern tokens
- [x] Automated native-control architecture gate

**Acceptance Criteria:**
- [x] [US-021] No application-native form controls remain outside the shared registry.
- [x] Components meet keyboard, focus, 44px touch-target and non-wrapping CTA requirements.

**BDD Scenario:** `.project/scenarios/sprint-8/frontend-architecture-remediation.feature`

### Task 8.2: Feature-first frontend refactor and overlay flows [Frontend]
**Status:** [COMPLETE]
**Estimated:** 8 hours | **Actual:** 8 hours
**Story Points:** 8
**Wireframe:** `06-fleet-customer-management.md`

**Deliverables:**
- [x] Nested feature folders for auth, fleet, customers, contracts, dashboard and settings
- [x] Vehicle/customer create dialogs and dedicated availability-calendar overlay
- [x] Separated hooks, API adapters, components, pages and utilities

**Acceptance Criteria:**
- [x] [US-021] No non-trivial state/query hooks are declared in component files.
- [x] Add and calendar actions no longer inject content inline into the list route.

**BDD Scenario:** `.project/scenarios/sprint-8/frontend-architecture-remediation.feature`

### Task 8.3: CreatedAt consistency across persistence, contracts and UI [Backend + Frontend]
**Status:** [COMPLETE]
**Estimated:** 5 hours | **Actual:** 5 hours
**Story Points:** 5
**Wireframe:** `06-fleet-customer-management.md`

**Deliverables:**
- [x] Forward Prisma migration for persisted models missing `createdAt`
- [x] Shared API contracts and repository mappings expose `createdAt`
- [x] Current vehicle/customer/pricing/contract UI shows localized creation time

**Acceptance Criteria:**
- [x] [US-021] Main list/detail records expose ISO creation timestamps.
- [x] Existing records migrate safely with a database default.

**BDD Scenario:** `.project/scenarios/sprint-8/frontend-architecture-remediation.feature`

### Task 8.R: Sprint 8 code review [Code Review]
**Status:** [COMPLETE]
**Estimated:** 2 hours | **Actual:** 2 hours
**Story Points:** 3
**Wireframe:** -

**Deliverables:**
- [x] Architecture, accessibility, dependency and BDD review

**Acceptance Criteria:**
- [x] Reviewer returns LGTM after all major findings are resolved.

**BDD Scenario:** `.project/scenarios/sprint-8/frontend-architecture-remediation.feature`

### Task 8.Q: Sprint 8 QA verification [QA]
**Status:** [COMPLETE]
**Estimated:** 4 hours | **Actual:** 4 hours
**Story Points:** 5
**Wireframe:** -

**Deliverables:**
- [x] Full regression, coverage, build and browser acceptance evidence

**Acceptance Criteria:**
- [x] All unit/integration/E2E tests pass and coverage remains at least 80%.
- [x] Desktop and 360px visual checks pass without wrapped actions or overflow.

**BDD Scenario:** `.project/scenarios/sprint-8/frontend-architecture-remediation.feature`

## Sprint Backlog

| ID | Task | Points | Status | Assignee | Wireframe |
|----|------|--------|--------|----------|-----------|
| 8.S | Frontend remediation BDD scenarios | 3 | [COMPLETE] | QA | `06-fleet-customer-management.md` |
| 8.1 | shadcn/Radix foundation and Inter | 5 | [COMPLETE] | Frontend | `components.md` |
| 8.2 | Feature-first refactor and overlay flows | 8 | [COMPLETE] | Frontend | `06-fleet-customer-management.md` |
| 8.3 | CreatedAt consistency | 5 | [COMPLETE] | Backend + Frontend | `06-fleet-customer-management.md` |
| 8.R | Sprint 8 code review | 3 | [COMPLETE — LGTM] | Code Review | - |
| 8.Q | Sprint 8 QA verification | 5 | [COMPLETE — PASS] | QA | - |

## Sprint Summary

**Total:** 6 tasks · 29 points · remediation takes priority over Sprint 4–7 execution.

## Definition of Done

- [x] BDD and architecture checks are green.
- [x] Production build, lint, typecheck and format pass.
- [x] Code review returns LGTM and QA approves regression/coverage.
- [x] Browser acceptance passes at desktop and 360px.

## Dependencies

- Approved Soft Modern design tokens remain the visual source of truth.
- React + Vite, TanStack Query and NestJS architecture remain unchanged.

## Risks & Blockers

- Broad import reorganization can cause regressions; all routes require automated coverage.
- Shadcn initialization must preserve existing semantic color tokens.

## Notes

- The client feedback dated 2026-09-01 is explicit approval for this remediation scope.
- Sprint 4–7 business work remains deferred until this sprint is accepted.
