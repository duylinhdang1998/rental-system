# Sprint 5: Return and Settlement

**Sprint:** 5 of 8  
**Duration:** 2 weeks  
**Goal:** Trả riêng từng xe, ghi phụ phí và tất toán chính xác.  
**Status:** PLANNED — EXECUTION DEFERRED

## Task Details

### Task 5.S: Return and settlement BDD scenarios [QA]
**Status:** [NOT STARTED]  
**Story Points:** 5  
**Wireframe:** Expanded before Sprint 5 Gate 2

**Deliverables:** Approved scenarios and money examples for US-016 and US-017.  
**Acceptance Criteria:** Partial return, deposit/document release, charges and refund/receivable formulas are explicit.

### Task 5.1: Partial-return domain and transaction [Backend]
**Status:** [NOT STARTED]  
**Story Points:** 8  
**Wireframe:** -

**Deliverables:** Per-vehicle return inspection, status/history and atomic update.  
**Acceptance Criteria:** Returning one vehicle never closes or corrupts remaining lines.

### Task 5.2: Charges and settlement policy [Backend]
**Status:** [NOT STARTED]  
**Story Points:** 8  
**Wireframe:** -

**Deliverables:** Late/damage/other charges and immutable settlement calculation.  
**Acceptance Criteria:** Golden money examples pass with integer VND and audit trail.

### Task 5.3: Return and inspection UI [Frontend]
**Status:** [NOT STARTED]  
**Story Points:** 8  
**Wireframe:** Expanded before Sprint 5 Gate 2

**Deliverables:** Queue, per-vehicle inspection, charge and evidence flow.  
**Acceptance Criteria:** Mobile handoff use, validation and upload states match BDD.

### Task 5.4: Settlement and release UI [Frontend]
**Status:** [NOT STARTED]  
**Story Points:** 5  
**Wireframe:** Expanded before Sprint 5 Gate 2

**Deliverables:** Amount breakdown, receivable/refund and deposit/document checklist.  
**Acceptance Criteria:** No ambiguous sign; confirmation identifies amount and recipient.

### Task 5.R: Sprint 5 code review [Code Review]
**Status:** [NOT STARTED]  
**Story Points:** 3  
**Wireframe:** -

**Deliverables:** Money, transaction, audit and UI review.  
**Acceptance Criteria:** LGTM after findings are fixed.

### Task 5.Q: Sprint 5 QA verification [QA]
**Status:** [NOT STARTED]  
**Story Points:** 8  
**Wireframe:** -

**Deliverables:** Regression, money reconciliation and browser acceptance report.  
**Acceptance Criteria:** BDD/build green and implemented logic coverage ≥80%.

## Sprint Backlog

| ID | Task | Points | Status | Assignee | Wireframe |
|----|------|--------|--------|----------|-----------|
| 5.S | Return/settlement BDD scenarios | 5 | | QA | Expand before Gate 2 |
| 5.1 | Partial-return domain/transaction | 8 | | Backend | - |
| 5.2 | Charges/settlement policy | 8 | | Backend | - |
| 5.3 | Return/inspection UI | 8 | | Frontend | Expand before Gate 2 |
| 5.4 | Settlement/release UI | 5 | | Frontend | Expand before Gate 2 |
| 5.R | Sprint 5 code review | 3 | | Code Review | - |
| 5.Q | Sprint 5 QA verification | 8 | | QA | - |

## Sprint Summary

**Total:** 7 tasks · 45 points · planned after Sprint 4.

## Definition of Done

- [ ] Return/settlement examples and wireframes approved.
- [ ] Partial return and settlement preserve history and reconcile exactly.
- [ ] Review LGTM and QA reconciliation/browser acceptance approved.

## Dependencies and Risks

- Depends on Sprint 4 lifecycle/history and approved late-fee formula.
- Use the private client `vehicle-return-schedule-sample.xlsx` to derive an anonymized golden fixture and validate return-queue field mapping.
- Damage catalog/return photos are Phase 2 unless promoted by approved change request.
- Money sign/refund handling requires explicit golden examples before development.
