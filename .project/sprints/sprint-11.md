# Sprint 11: Asset Economics — Cost, Depreciation, Expenses and Break-even

**Sprint:** 11 (Phase 2, first of three)  
**Duration:** 2 weeks  
**Goal:** Chủ biết mỗi xe tốn bao nhiêu, đã thu bao nhiêu, chi bao nhiêu và khi nào hòa vốn.  
**Status:** COMPLETE — Code Review LGTM, QA PASS (2026-09-18)

## Task Details

### Task 11.S: Asset economics BDD scenarios [QA]
**Status:** [COMPLETE]
**Story Points:** 5  
**Wireframe:** `12-asset-economics.md`

**Deliverables:** 16 scenarios (three outlines) in `.project/scenarios/sprint-11/asset-economics.feature` covering US-023, US-024 and US-025 with golden depreciation, attribution and break-even examples.  
**Acceptance Criteria:** Depreciation, idempotency, reversal rules, attribution, break-even and Owner-only access are explicit.

### Task 11.1: Vehicle acquisition and expense ledger [Backend]
**Status:** [COMPLETE]
**Story Points:** 8  
**Wireframe:** -

**Deliverables:** `VehicleAcquisition` and append-only `Expense` persistence (demo + Prisma, migration `202609180001_asset_economics`), Owner-only acquisition upsert with before/after audit, expense record (idempotent replay, vehicle lookup), Owner reversal entries (BR-09), filtered list with totals and recorder names.  
**Acceptance Criteria:** Replays are idempotent, reversals are the only correction path, Staff cannot reverse or set costs.

### Task 11.2: Fleet economics report and export [Backend]
**Status:** [COMPLETE]
**Story Points:** 8  
**Wireframe:** -

**Deliverables:** Depreciation math in `@rental/contracts`, revenue attribution from contract snapshots, break-even projection from the trailing 90-day rate, Owner-only `GET /api/reports/fleet-economics` and the "Đội xe" workbook export.  
**Acceptance Criteria:** Figures reconcile to the golden fixtures and Staff receives 403.

### Task 11.3: Acquisition dialog and expenses UI [Frontend]
**Status:** [COMPLETE]
**Story Points:** 8  
**Wireframe:** `12-asset-economics.md`

**Deliverables:** Owner "Giá vốn" dialog on the vehicle list with live depreciation preview, `/expenses` page (filters, KPI cards, table / cards, "Ghi chi phí" dialog with one idempotency key per instance, Owner-only reversal dialog), navigation entry.  
**Acceptance Criteria:** Validation mirrors the API, reversal affordance never renders for Staff, desktop and phone layouts pass the axe sweep.

### Task 11.4: Fleet economics page [Frontend]
**Status:** [COMPLETE]
**Story Points:** 5  
**Wireframe:** `12-asset-economics.md`

**Deliverables:** `/reports/fleet` Owner page with as-of date, KPI cards, per-vehicle table / cards, unallocated and totals rows, break-even badges, Excel link and the shared report tab strip.  
**Acceptance Criteria:** Locale-aware money, Owner-only route and API, tabs switch between the two reports.

### Task 11.R: Sprint 11 code review [Code Review]
**Status:** [COMPLETE] — LGTM after CR-11-01..03
**Story Points:** 3  
**Wireframe:** -

**Deliverables:** `.project/reviews/sprint-11-code-review.md`.  
**Acceptance Criteria:** LGTM after findings are fixed.

### Task 11.Q: Sprint 11 QA verification [QA]
**Status:** [COMPLETE] — PASS (292 + 71)
**Story Points:** 5  
**Wireframe:** -

**Deliverables:** `.project/state/specialists/google-qa-engineer-sprint-11.md`.  
**Acceptance Criteria:** BDD, regression, browser and coverage gates pass.

## Sprint Backlog

| ID | Task | Points | Status | Assignee | Wireframe |
|----|------|--------|--------|----------|-----------|
| 11.S | Asset economics BDD scenarios | 5 | [COMPLETE] | QA | `12-asset-economics.md` |
| 11.1 | Vehicle acquisition and expense ledger | 8 | [COMPLETE] | Backend | - |
| 11.2 | Fleet economics report and export | 8 | [COMPLETE] | Backend | - |
| 11.3 | Acquisition dialog and expenses UI | 8 | [COMPLETE] | Frontend | `12-asset-economics.md` |
| 11.4 | Fleet economics page | 5 | [COMPLETE] | Frontend | `12-asset-economics.md` |
| 11.R | Sprint 11 code review | 3 | [COMPLETE] | Code Review | - |
| 11.Q | Sprint 11 QA verification | 5 | [COMPLETE] | QA | - |

## Definition of Done

- [x] Every scenario in `asset-economics.feature` is covered by a green test.
- [x] Lint, typecheck, unit/integration (292), coverage ≥ 80 % (96.02 / 85.02 / 95.84 / 96.82), build, Prisma validation, audit and browser suites (71) pass.
- [x] Code review LGTM (`reviews/sprint-11-code-review.md`) and QA PASS (`state/specialists/google-qa-engineer-sprint-11.md`).
- [x] Operator guide gains the three new screens (Sprint 11 version).

## Dependencies and Risks

- Builds on Sprint 7 (`feature/sprint-7-hardening-golive`); no provider-side gate is needed.
- Revenue attribution is accrual by contract line, not cash; the Owner must read the report
  next to the cash-based revenue report (documented in the operator guide).
- Depreciation is straight-line only; other methods are out of scope unless the Product Owner
  asks (PD-16).
