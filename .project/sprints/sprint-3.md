# Sprint 3: Pricing and Multi-vehicle Contract Creation

**Sprint:** 3 of 8  
**Duration:** 2 weeks  
**Goal:** Lập được hợp đồng nhiều xe với kiểm tra lịch, giá, bàn giao và PDF.  
**Status:** COMPLETE — QA PASS

## Task Details

### Task 3.S: Pricing and contract BDD scenarios [QA]
**Status:** [COMPLETE]
**Story Points:** 8  
**Wireframe:** `07-contract-creation.md`

**Deliverables:** Approved scenarios and golden pricing examples for US-007, US-010–US-013.  
**Acceptance Criteria:** Day calculation, overlap boundaries, override/audit and PDF examples are unambiguous.

### Task 3.1: Pricing policy and configuration [Backend]
**Status:** [COMPLETE]
**Story Points:** 8  
**Wireframe:** -

**Deliverables:** Versioned price tiers, customer-tag rules, snapshots and pure calculation policy.  
**Acceptance Criteria:** Golden examples pass unit/property tests with integer VND.

### Task 3.2: Availability and contract transaction [Backend]
**Status:** [COMPLETE]
**Story Points:** 8  
**Wireframe:** -

**Deliverables:** Overlap policy, multi-vehicle contract transaction and database constraints.  
**Acceptance Criteria:** Concurrent double-booking attempts cannot commit conflicting reservations.

### Task 3.3: Handover, file and PDF service [Backend]
**Status:** [COMPLETE]
**Story Points:** 8  
**Wireframe:** -

**Deliverables:** Deposit/document/handover records, private images and bilingual PDF job.  
**Acceptance Criteria:** Approved PDF fixture and signed-file access tests pass.

### Task 3.4: Contract creation UI [Frontend]
**Status:** [COMPLETE]
**Story Points:** 8  
**Wireframe:** `07-contract-creation.md`

**Deliverables:** Responsive multi-step customer/vehicle/pricing/handover/confirmation flow.  
**Acceptance Criteria:** Validation, price explanation, conflict recovery and accessibility match BDD.

### Task 3.R: Sprint 3 code review [Code Review]
**Status:** [COMPLETE]
**Story Points:** 3  
**Wireframe:** -

**Deliverables:** Transaction, security, pricing and UI review.  
**Acceptance Criteria:** LGTM after findings are fixed.

### Task 3.Q: Sprint 3 QA verification [QA]
**Status:** [COMPLETE]
**Story Points:** 8  
**Wireframe:** -

**Deliverables:** Regression, concurrency, PDF and browser acceptance report.  
**Acceptance Criteria:** BDD/build green and implemented logic coverage ≥80%.

## Sprint Backlog

| ID | Task | Points | Status | Assignee | Wireframe |
|----|------|--------|--------|----------|-----------|
| 3.S | Pricing/contract BDD scenarios | 8 | [COMPLETE] | QA | `07-contract-creation.md` |
| 3.1 | Pricing policy/configuration | 8 | [COMPLETE] | Backend | - |
| 3.2 | Availability/contract transaction | 8 | [COMPLETE] | Backend | - |
| 3.3 | Handover/file/PDF service | 8 | [COMPLETE] | Backend | - |
| 3.4 | Contract creation UI | 8 | [COMPLETE] | Frontend | `07-contract-creation.md` |
| 3.R | Sprint 3 code review | 3 | [COMPLETE — LGTM] | Code Review | - |
| 3.Q | Sprint 3 QA verification | 8 | [COMPLETE — PASS] | QA | - |

## Sprint Summary

**Total:** 7 tasks · 51 points · all four batches complete.

QA evidence: 54 unit/integration tests and 18 browser journeys passed. Coverage reached
95.80% statements, 80.74% branches, 94.63% functions and 96.63% lines. Format, lint,
typecheck, production build, Prisma validation and high-severity dependency audit passed.

## Definition of Done

- [x] Business pricing decisions, PDF template and contract wireframes approved.
- [x] Multi-vehicle creation is atomic and overlap-safe.
- [x] Review LGTM; QA regression/concurrency/browser acceptance approved.

## Dependencies and Risks

- Extension repricing remains deferred to Sprint 4 as agreed.
- The system PDF is the approved starter template and can be replaced when the client sends a legal template.
- PostgreSQL exclusion constraints and application transactions both protect against overlapping bookings.
