# Sprint 5: Return and Settlement

**Sprint:** 5 of 8  
**Duration:** 2 weeks  
**Goal:** Trả riêng từng xe, ghi phụ phí và tất toán chính xác.  
**Status:** COMPLETE — QA PASS

## Task Details

### Task 5.S: Return and settlement BDD scenarios [QA]
**Status:** [COMPLETE]
**Story Points:** 5  
**Wireframe:** `09-return-settlement.md`

**Deliverables:** 18 approved scenarios (4 outlines) in `.project/scenarios/sprint-5/return-settlement.feature` covering US-016 and US-017 with golden money examples.  
**Acceptance Criteria:** Partial return, deposit/document release, charges and refund/receivable formulas are explicit.

### Task 5.1: Partial-return domain and transaction [Backend]
**Status:** [COMPLETE]
**Story Points:** 8  
**Wireframe:** -

**Deliverables:** Per-vehicle return with actual time, condition, fuel, private photos and late fee snapshot; condition-driven vehicle status and history; derived completion when the last line returns (BR-03); return queue endpoint; Prisma migration `202609100001_return_settlement`.  
**Acceptance Criteria:** Returning one vehicle never closes or corrupts remaining lines.

### Task 5.2: Charges and settlement policy [Backend]
**Status:** [COMPLETE]
**Story Points:** 8  
**Wireframe:** -

**Deliverables:** Immutable LATE_RETURN/DAMAGE/OTHER/DISCOUNT charges (discount Owner-only, BR-06), statement with explicit receivable and refund (BR-04), deposit cap and release checklist, frozen settlement snapshot (BR-07), shared money math in `@rental/contracts`.  
**Acceptance Criteria:** Golden money examples pass with integer VND and audit trail.

### Task 5.3: Return and inspection UI [Frontend]
**Status:** [COMPLETE]
**Story Points:** 8  
**Wireframe:** `09-return-settlement.md`

**Deliverables:** Live `/returns` queue (overdue, due today, later) with KPI cards, per-line “Nhận xe” dialog shared with the contract detail page, late-fee preview from the shared formula, condition/fuel/notes and optional inspection charge, per-line inspection summary on the detail page.  
**Acceptance Criteria:** Mobile handoff use, validation and upload states match BDD.

### Task 5.4: Settlement and release UI [Frontend]
**Status:** [COMPLETE]
**Story Points:** 5  
**Wireframe:** `09-return-settlement.md`

**Deliverables:** Settlement panel with statement items and figure rows, outcome badge (receivable/refund/balanced), manual charge dialog, settlement dialog with deposit cap, document/deposit checklist and frozen state, settlement badge on contract lists.  
**Acceptance Criteria:** No ambiguous sign; confirmation identifies amount and recipient.

### Task 5.R: Sprint 5 code review [Code Review]
**Status:** [COMPLETE — LGTM]
**Story Points:** 3  
**Wireframe:** -

**Deliverables:** `.project/reviews/sprint-5-code-review.md`.  
**Acceptance Criteria:** LGTM after findings are fixed.

### Task 5.Q: Sprint 5 QA verification [QA]
**Status:** [COMPLETE — PASS]
**Story Points:** 8  
**Wireframe:** -

**Deliverables:** `.project/state/specialists/google-qa-engineer-sprint-5.md`.  
**Acceptance Criteria:** BDD/build green and implemented logic coverage ≥80%.

## Sprint Backlog

| ID | Task | Points | Status | Assignee | Wireframe |
|----|------|--------|--------|----------|-----------|
| 5.S | Return/settlement BDD scenarios | 5 | [COMPLETE] | QA | `09-return-settlement.md` |
| 5.1 | Partial-return domain/transaction | 8 | [COMPLETE] | Backend | - |
| 5.2 | Charges/settlement policy | 8 | [COMPLETE] | Backend | - |
| 5.3 | Return/inspection UI | 8 | [COMPLETE] | Frontend | `09-return-settlement.md` |
| 5.4 | Settlement/release UI | 5 | [COMPLETE] | Frontend | `09-return-settlement.md` |
| 5.R | Sprint 5 code review | 3 | [COMPLETE — LGTM] | Code Review | - |
| 5.Q | Sprint 5 QA verification | 8 | [COMPLETE — PASS] | QA | - |

## Sprint Summary

**Total:** 7 tasks · 45 points · all complete on 2026-09-10.

QA evidence: 151 unit/integration tests and 37 browser journeys passed. Coverage reached
95.69% statements, 85.12% branches, 95.06% functions and 96.81% lines. Format, lint, strict typecheck, production build and Prisma schema validation passed.

## Definition of Done

- [x] Return/settlement examples and wireframes approved (PD-12 defaults applied while the Product Owner confirms).
- [x] Partial return and settlement preserve history and reconcile exactly.
- [x] Review LGTM and QA reconciliation/browser acceptance approved.

## Dependencies and Risks

- Built on Sprint 4 lifecycle/history and the approved PD-05 late-fee rule.
- PD-12: deposit applied is capped at `min(deposit, outstanding)`, discounts are Owner-only,
  early return does not refund unused days, and any remaining receivable waits for the Sprint 6
  payment ledger (`paidVnd` is 0 until then). These are working defaults pending confirmation.
- Migration `202609100001_return_settlement` must be applied before deploying the API.
- The private `vehicle-return-schedule-sample.xlsx` informed the queue field mapping; all
  fixtures, seeds and tests remain synthetic and the workbook stays outside Git.
- Damage catalog and return-photo upload UI remain Phase 2; the API stores private image keys
  and exposes only counts.
- Local toolchain: Node 24; `@rental/contracts` build and `prisma generate` must run before
  lint/typecheck/tests; Vitest hook/test timeouts are 30 s because every API test boots a
  NestJS app under parallel workers.
