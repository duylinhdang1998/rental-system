# Sprint 4: Contract Lifecycle and Daily Operations

**Sprint:** 4 of 8  
**Duration:** 2 weeks  
**Goal:** Quản lý đặt trước, đang thuê, quá hạn, hủy, gia hạn và đổi xe.  
**Status:** COMPLETE — QA PASS

## Task Details

### Task 4.S: Lifecycle BDD scenarios [QA]
**Status:** [COMPLETE]
**Story Points:** 5  
**Wireframe:** `03-dashboard.md`, `07-contract-creation.md` (detail/list extension)

**Deliverables:** 17 approved scenarios in `.project/scenarios/sprint-4/contract-lifecycle.feature` covering US-014, US-015 and lifecycle states.  
**Acceptance Criteria:** Allowed/forbidden transitions, time boundaries and history rules are explicit.

### Task 4.1: Contract state machine and overdue job [Backend]
**Status:** [COMPLETE]
**Story Points:** 8  
**Wireframe:** -

**Deliverables:** Pure transition policy, activate/complete use cases, idempotent scheduled overdue evaluation in Asia/Ho_Chi_Minh business time, vehicle-status synchronization and contract events.  
**Acceptance Criteria:** Idempotency, timezone and audit tests pass.

### Task 4.2: Cancel, extend and swap use cases [Backend]
**Status:** [COMPLETE]
**Story Points:** 8  
**Wireframe:** -

**Deliverables:** Reasoned cancellation that releases holds, extension with conflict check and whole-period repricing from the contract pricing snapshot, linked vehicle swap that inherits the remaining period and price, Prisma migration `202609090001_contract_lifecycle`.  
**Acceptance Criteria:** Conflicts roll back safely and original history remains immutable.

### Task 4.3: Lifecycle and extension/swap UI [Frontend]
**Status:** [COMPLETE]
**Story Points:** 8  
**Wireframe:** Contract list and detail pages

**Deliverables:** Contract list with search/status filters, detail page with timeline, status-driven actions, confirmation dialogs for handover/return, reasoned cancel, extend and swap dialogs with conflict alerts.  
**Acceptance Criteria:** Destructive confirmation and conflict states match BDD.

### Task 4.4: Today and overdue operations board [Frontend]
**Status:** [COMPLETE]
**Story Points:** 5  
**Wireframe:** `03-dashboard.md`

**Deliverables:** Live board from `GET /api/contracts/board`: KPIs, overdue-first priority list with explicit hours late, pickup/return schedule filter, fleet share and linked contract details.  
**Acceptance Criteria:** Priority and explicit time differences work on desktop/mobile.

### Task 4.R: Sprint 4 code review [Code Review]
**Status:** [COMPLETE — LGTM]
**Story Points:** 3  
**Wireframe:** -

**Deliverables:** `.project/reviews/sprint-4-code-review.md`.  
**Acceptance Criteria:** LGTM after findings are fixed.

### Task 4.Q: Sprint 4 QA verification [QA]
**Status:** [COMPLETE — PASS]
**Story Points:** 5  
**Wireframe:** -

**Deliverables:** `.project/state/specialists/google-qa-engineer-sprint-4.md`.  
**Acceptance Criteria:** BDD/build green and implemented logic coverage ≥80%.

## Sprint Backlog

| ID | Task | Points | Status | Assignee | Wireframe |
|----|------|--------|--------|----------|-----------|
| 4.S | Lifecycle BDD scenarios | 5 | [COMPLETE] | QA | `03-dashboard.md` |
| 4.1 | State machine/overdue job | 8 | [COMPLETE] | Backend | - |
| 4.2 | Cancel/extend/swap use cases | 8 | [COMPLETE] | Backend | - |
| 4.3 | Lifecycle UI | 8 | [COMPLETE] | Frontend | Contract list/detail |
| 4.4 | Today/overdue board | 5 | [COMPLETE] | Frontend | `03-dashboard.md` |
| 4.R | Sprint 4 code review | 3 | [COMPLETE — LGTM] | Code Review | - |
| 4.Q | Sprint 4 QA verification | 5 | [COMPLETE — PASS] | QA | - |

## Sprint Summary

**Total:** 7 tasks · 42 points · all complete on 2026-09-09.

QA evidence: 111 unit/integration tests and 36 browser journeys passed. Coverage reached
95.06% statements, 81.42% branches, 94.7% functions and 96.36% lines. Format, lint, strict
typecheck, production build and Prisma schema validation passed.

## Definition of Done

- [x] Lifecycle rules and scenarios approved before development (PD-06 applied as working default).
- [x] Transitions, jobs and swaps are transactional, idempotent and audited.
- [x] Review LGTM and QA regression/browser acceptance approved.

## Dependencies and Risks

- Built on Sprint 3 contracts, availability and price snapshots; Sprint 8 frontend structure.
- PD-06: extension reprices the whole period by the final tier of the contract snapshot. This is
  the recommended default and must be confirmed or changed by the Product Owner.
- Migration `202609090001_contract_lifecycle` must be applied before deploying the API.
- The overdue job runs in-process on an interval; evaluation is idempotent, but a multi-instance
  deployment should add a leader lock or move the job to the database scheduler.
- Local toolchain: Node 24 (argon2 crashes on Node 22); `@rental/contracts` build and
  `prisma generate` must run before lint/typecheck/tests.
