# Sprint 3: Pricing and Multi-vehicle Contract Creation

**Sprint:** 3 of 8  
**Duration:** 2 weeks  
**Goal:** Lập được hợp đồng nhiều xe với kiểm tra lịch, giá, bàn giao và PDF.  
**Status:** PLANNED — EXECUTION DEFERRED

## Task Details

### Task 3.S: Pricing and contract BDD scenarios [QA]
**Status:** [NOT STARTED]  
**Story Points:** 8  
**Wireframe:** `04-module-previews.md`

**Deliverables:** Approved scenarios and golden pricing examples for US-007, US-010–US-013.  
**Acceptance Criteria:** Day calculation, overlap boundaries, override/audit and PDF examples are unambiguous.

### Task 3.1: Pricing policy and configuration [Backend]
**Status:** [NOT STARTED]  
**Story Points:** 8  
**Wireframe:** -

**Deliverables:** Versioned price tiers, customer-tag rules, snapshots and pure calculation policy.  
**Acceptance Criteria:** Golden examples pass unit/property tests with integer VND.

### Task 3.2: Availability and contract transaction [Backend]
**Status:** [NOT STARTED]  
**Story Points:** 8  
**Wireframe:** -

**Deliverables:** Overlap policy, multi-vehicle contract transaction and database constraints.  
**Acceptance Criteria:** Concurrent double-booking attempts cannot commit conflicting reservations.

### Task 3.3: Handover, file and PDF service [Backend]
**Status:** [NOT STARTED]  
**Story Points:** 8  
**Wireframe:** -

**Deliverables:** Deposit/document/handover records, private images and bilingual PDF job.  
**Acceptance Criteria:** Approved PDF fixture and signed-file access tests pass.

### Task 3.4: Contract creation UI [Frontend]
**Status:** [NOT STARTED]  
**Story Points:** 8  
**Wireframe:** Expanded before Sprint 3 Gate 2

**Deliverables:** Responsive multi-step customer/vehicle/pricing/handover/confirmation flow.  
**Acceptance Criteria:** Validation, price explanation, conflict recovery and accessibility match BDD.

### Task 3.R: Sprint 3 code review [Code Review]
**Status:** [NOT STARTED]  
**Story Points:** 3  
**Wireframe:** -

**Deliverables:** Transaction, security, pricing and UI review.  
**Acceptance Criteria:** LGTM after findings are fixed.

### Task 3.Q: Sprint 3 QA verification [QA]
**Status:** [NOT STARTED]  
**Story Points:** 8  
**Wireframe:** -

**Deliverables:** Regression, concurrency, PDF and browser acceptance report.  
**Acceptance Criteria:** BDD/build green and implemented logic coverage ≥80%.

## Sprint Backlog

| ID | Task | Points | Status | Assignee | Wireframe |
|----|------|--------|--------|----------|-----------|
| 3.S | Pricing/contract BDD scenarios | 8 | | QA | `04-module-previews.md` |
| 3.1 | Pricing policy/configuration | 8 | | Backend | - |
| 3.2 | Availability/contract transaction | 8 | | Backend | - |
| 3.3 | Handover/file/PDF service | 8 | | Backend | - |
| 3.4 | Contract creation UI | 8 | | Frontend | Expand before Gate 2 |
| 3.R | Sprint 3 code review | 3 | | Code Review | - |
| 3.Q | Sprint 3 QA verification | 8 | | QA | - |

## Sprint Summary

**Total:** 7 tasks · 51 points · planned after Sprint 2.

## Definition of Done

- [ ] Business pricing decisions, PDF template and contract wireframes approved.
- [ ] Multi-vehicle creation is atomic and overlap-safe.
- [ ] Review LGTM; QA regression/concurrency/browser acceptance approved.

## Dependencies and Risks

- Requires final rules for rental-day calculation, extension pricing and advance booking.
- Requires approved bilingual contract sample before PDF implementation.
- Pricing and availability are high-risk logic and need golden/concurrency tests.

