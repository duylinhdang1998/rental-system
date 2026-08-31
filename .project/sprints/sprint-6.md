# Sprint 6: Payments, Receivables and Reporting

**Sprint:** 6 of 8  
**Duration:** 2 weeks  
**Goal:** Thu nhiều lần/nhiều hình thức và đối soát doanh thu, công nợ, nhân viên.  
**Status:** PLANNED — EXECUTION DEFERRED

## Task Details

### Task 6.S: Finance and reporting BDD scenarios [QA]
**Status:** [NOT STARTED]  
**Story Points:** 5  
**Wireframe:** `04-module-previews.md`

**Deliverables:** Approved reconciliation/report examples for US-018 and US-019.  
**Acceptance Criteria:** Receipts, allocations, aging, owner-only access and Excel totals are explicit.

### Task 6.1: Payment and receivable ledger [Backend]
**Status:** [NOT STARTED]  
**Story Points:** 8  
**Wireframe:** -

**Deliverables:** Immutable payment/refund/adjustment transactions and allocations.  
**Acceptance Criteria:** Replays are idempotent and balances reconcile to source transactions.

### Task 6.2: Reporting and Excel export [Backend]
**Status:** [NOT STARTED]  
**Story Points:** 8  
**Wireframe:** -

**Deliverables:** Revenue/debt/employee queries and approved Excel export.  
**Acceptance Criteria:** Totals match golden dataset and Staff cannot access aggregates.

### Task 6.3: Payment and receivable UI [Frontend]
**Status:** [NOT STARTED]  
**Story Points:** 8  
**Wireframe:** Expanded before Sprint 6 Gate 2

**Deliverables:** Multi-payment entry, history, balance and receivable views.  
**Acceptance Criteria:** Method splits and amount validation are clear on desktop/mobile.

### Task 6.4: Reporting UI and export [Frontend]
**Status:** [NOT STARTED]  
**Story Points:** 8  
**Wireframe:** `04-module-previews.md`

**Deliverables:** Owner reports, filters, chart/table fallback and Excel action.  
**Acceptance Criteria:** Accessibility, authorization and locale-aware values match BDD.

### Task 6.R: Sprint 6 code review [Code Review]
**Status:** [NOT STARTED]  
**Story Points:** 3  
**Wireframe:** -

**Deliverables:** Ledger, query, authorization and export review.  
**Acceptance Criteria:** LGTM after findings are fixed.

### Task 6.Q: Sprint 6 QA verification [QA]
**Status:** [NOT STARTED]  
**Story Points:** 8  
**Wireframe:** -

**Deliverables:** Full reconciliation, regression and browser acceptance report.  
**Acceptance Criteria:** BDD/build green and implemented logic coverage ≥80%.

## Sprint Backlog

| ID | Task | Points | Status | Assignee | Wireframe |
|----|------|--------|--------|----------|-----------|
| 6.S | Finance/reporting BDD scenarios | 5 | | QA | `04-module-previews.md` |
| 6.1 | Payment/receivable ledger | 8 | | Backend | - |
| 6.2 | Reporting/Excel export | 8 | | Backend | - |
| 6.3 | Payment/receivable UI | 8 | | Frontend | Expand before Gate 2 |
| 6.4 | Reporting UI/export | 8 | | Frontend | `04-module-previews.md` |
| 6.R | Sprint 6 code review | 3 | | Code Review | - |
| 6.Q | Sprint 6 QA verification | 8 | | QA | - |

## Sprint Summary

**Total:** 7 tasks · 48 points · planned after Sprint 5.

## Definition of Done

- [ ] Report/Excel sample and finance examples approved.
- [ ] Ledger and reports reconcile to the golden dataset.
- [ ] Review LGTM and QA reconciliation/browser acceptance approved.

## Dependencies and Risks

- Use the received private `daily-revenue-report-sample.xlsx` as the baseline; approve anonymized golden totals and final Excel layout in Batch 0.
- Depends on Sprint 5 settlement and immutable financial adjustments.
- Financial aggregate access is Owner-only at both API and UI boundaries.
