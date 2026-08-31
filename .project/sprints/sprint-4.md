# Sprint 4: Contract Lifecycle and Daily Operations

**Sprint:** 4 of 8  
**Duration:** 2 weeks  
**Goal:** Quản lý đặt trước, đang thuê, quá hạn, hủy, gia hạn và đổi xe.  
**Status:** PLANNED — EXECUTION DEFERRED

## Task Details

### Task 4.S: Lifecycle BDD scenarios [QA]
**Status:** [NOT STARTED]  
**Story Points:** 5  
**Wireframe:** Expanded before Sprint 4 Gate 2

**Deliverables:** Approved scenarios for US-014, US-015 and lifecycle states.  
**Acceptance Criteria:** Allowed/forbidden transitions, time boundaries and history rules are explicit.

### Task 4.1: Contract state machine and overdue job [Backend]
**Status:** [NOT STARTED]  
**Story Points:** 8  
**Wireframe:** -

**Deliverables:** State machine, scheduled overdue evaluation and vehicle-status synchronization.  
**Acceptance Criteria:** Idempotency, timezone and audit tests pass.

### Task 4.2: Cancel, extend and swap use cases [Backend]
**Status:** [NOT STARTED]  
**Story Points:** 8  
**Wireframe:** -

**Deliverables:** Transactional cancellation, extension and linked vehicle-swap history.  
**Acceptance Criteria:** Conflicts roll back safely and original history remains immutable.

### Task 4.3: Lifecycle and extension/swap UI [Frontend]
**Status:** [NOT STARTED]  
**Story Points:** 8  
**Wireframe:** Expanded before Sprint 4 Gate 2

**Deliverables:** Contract timeline, cancel, extend and swap flows.  
**Acceptance Criteria:** Destructive confirmation and conflict states match BDD.

### Task 4.4: Today and overdue operations board [Frontend]
**Status:** [NOT STARTED]  
**Story Points:** 5  
**Wireframe:** `03-dashboard.md`

**Deliverables:** Live due-today/overdue lists and filters.  
**Acceptance Criteria:** Priority and explicit time differences work on desktop/mobile.

### Task 4.R: Sprint 4 code review [Code Review]
**Status:** [NOT STARTED]  
**Story Points:** 3  
**Wireframe:** -

**Deliverables:** State-machine, transaction and UI review.  
**Acceptance Criteria:** LGTM after findings are fixed.

### Task 4.Q: Sprint 4 QA verification [QA]
**Status:** [NOT STARTED]  
**Story Points:** 5  
**Wireframe:** -

**Deliverables:** Time-boundary, regression and browser acceptance report.  
**Acceptance Criteria:** BDD/build green and implemented logic coverage ≥80%.

## Sprint Backlog

| ID | Task | Points | Status | Assignee | Wireframe |
|----|------|--------|--------|----------|-----------|
| 4.S | Lifecycle BDD scenarios | 5 | | QA | Expand before Gate 2 |
| 4.1 | State machine/overdue job | 8 | | Backend | - |
| 4.2 | Cancel/extend/swap use cases | 8 | | Backend | - |
| 4.3 | Lifecycle UI | 8 | | Frontend | Expand before Gate 2 |
| 4.4 | Today/overdue board | 5 | | Frontend | `03-dashboard.md` |
| 4.R | Sprint 4 code review | 3 | | Code Review | - |
| 4.Q | Sprint 4 QA verification | 5 | | QA | - |

## Sprint Summary

**Total:** 7 tasks · 42 points · planned after Sprint 3.

## Definition of Done

- [ ] Lifecycle rules and wireframes approved before development.
- [ ] Transitions, jobs and swaps are transactional, idempotent and audited.
- [ ] Review LGTM and QA regression/browser acceptance approved.

## Dependencies and Risks

- Depends on Sprint 3 contracts, availability and price snapshots.
- Extension pricing remains blocked until the Product Owner answers the pricing rule.
- Scheduled jobs must use Asia/Ho_Chi_Minh business time over UTC persistence.

