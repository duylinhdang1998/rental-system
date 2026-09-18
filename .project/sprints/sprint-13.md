# Sprint 13: Advanced Reporting — Analytics, Utilisation, Profit and Loss, Trend Charts

**Sprint:** 13 (Phase 2, third of three)  
**Duration:** 2 weeks  
**Goal:** Chủ cửa hàng nhìn thấy doanh thu theo loại xe, xe, quốc tịch khách và tháng; phụ phí; tỷ lệ sử dụng xe; lãi lỗ hằng tháng và xu hướng 12 tháng — để tối ưu đội xe và bảng giá.  
**Status:** COMPLETE — Code Review LGTM, QA PASS (2026-09-18)

## Task Details

### Task 13.S: Advanced reporting BDD scenarios [QA]
**Status:** [COMPLETE]
**Story Points:** 3  
**Wireframe:** `14-advanced-reporting.md`

**Deliverables:** 14 scenarios (three outlines) in `.project/scenarios/sprint-13/advanced-reporting.feature` covering US-029 and US-030 with golden revenue, utilisation, depreciation and chart-geometry figures.  
**Acceptance Criteria:** Reconciliation across dimensions, the 366-day limit, the P&L arithmetic and the chart fallback are explicit.

### Task 13.1: Revenue events, dimension and surcharge reports [Backend]
**Status:** [COMPLETE]
**Story Points:** 5  
**Wireframe:** -

**Deliverables:** `analytics` contracts, revenue-event accrual shared by every dimension, type / vehicle / nationality / month rows, surcharge rows, Owner-only `GET /api/reports/analytics` with a 366-day window.  
**Acceptance Criteria:** Every dimension sums to the same total; unallocated revenue is visible; Staff 403; span > 366 days 400 — `tests/domain/analytics.test.ts`, `tests/api/analytics-report.test.ts`.

### Task 13.2: Utilisation [Backend]
**Status:** [COMPLETE]
**Story Points:** 3  
**Wireframe:** -

**Deliverables:** Occupied intervals per vehicle (actual return ends a line), rented over available days per vehicle, per type and for the fleet.  
**Acceptance Criteria:** Golden outline rows; a vehicle created inside the window counts only its own days — `tests/domain/utilisation.test.ts`.

### Task 13.3: Monthly profit and loss [Backend]
**Status:** [COMPLETE]
**Story Points:** 5  
**Wireframe:** -

**Deliverables:** `GET /api/reports/pnl?to=YYYY-MM&months=1..24`, revenue − expenses − depreciation per month with totals, defaults to the current business month and 12 months.  
**Acceptance Criteria:** Golden months including the first depreciation month and reversals — `tests/domain/pnl.test.ts`, `tests/api/pnl-report.test.ts`.

### Task 13.4: Multi-sheet workbook exports [Backend]
**Status:** [COMPLETE]
**Story Points:** 2  
**Wireframe:** -

**Deliverables:** `encodeSheets` in the dependency-free writer (PD-13), six-sheet analytics export, one-sheet P&L export, export throttle policy.  
**Acceptance Criteria:** Sheet names and numeric cells verified from the ZIP — `tests/api/analytics-report.test.ts`, `tests/api/pnl-report.test.ts`.

### Task 13.5: Analytics page [Frontend]
**Status:** [COMPLETE]
**Story Points:** 5  
**Wireframe:** `14-advanced-reporting.md`

**Deliverables:** `/reports/analytics` with the report tab strip, 366-day range form, KPI cards, monthly chart + table, four dimension tables, surcharge and utilisation tables, export link.  
**Acceptance Criteria:** No request for an invalid range; every table row carries a test hook; axe sweep passes — `tests/admin/analytics-presentation.test.ts`, `e2e/advanced-reporting.spec.ts`.

### Task 13.6: Profit and loss page and trend charts [Frontend]
**Status:** [COMPLETE]
**Story Points:** 5  
**Wireframe:** `14-advanced-reporting.md`

**Deliverables:** `/reports/pnl` with month / months form, KPI cards, three-line inline SVG trend chart from pure geometry with a table fallback, month table and phone cards, export link.  
**Acceptance Criteria:** Chart geometry outline passes; negative money uses a true minus sign; Staff denied — `tests/admin/analytics-presentation.test.ts`, `e2e/advanced-reporting.spec.ts`.

### Task 13.R: Sprint 13 code review [Code Review]
**Status:** [COMPLETE]
**Story Points:** 2  
**Wireframe:** -

**Deliverables:** `.project/reviews/sprint-13-code-review.md`.  
**Acceptance Criteria:** LGTM with every blocking finding fixed.

### Task 13.Q: Sprint 13 QA verification [QA]
**Status:** [COMPLETE]
**Story Points:** 3  
**Wireframe:** -

**Deliverables:** `.project/state/specialists/google-qa-engineer-sprint-13.md`.  
**Acceptance Criteria:** BDD, regression, browser and coverage gates pass.

## Sprint Backlog

| ID | Task | Points | Status | Assignee | Wireframe |
|----|------|--------|--------|----------|-----------|
| 13.S | Advanced reporting BDD scenarios | 3 | [COMPLETE] | QA | `14-advanced-reporting.md` |
| 13.1 | Revenue events, dimension and surcharge reports | 5 | [COMPLETE] | Backend | - |
| 13.2 | Utilisation | 3 | [COMPLETE] | Backend | - |
| 13.3 | Monthly profit and loss | 5 | [COMPLETE] | Backend | - |
| 13.4 | Multi-sheet workbook exports | 2 | [COMPLETE] | Backend | - |
| 13.5 | Analytics page | 5 | [COMPLETE] | Frontend | `14-advanced-reporting.md` |
| 13.6 | Profit and loss page and trend charts | 5 | [COMPLETE] | Frontend | `14-advanced-reporting.md` |
| 13.R | Sprint 13 code review | 2 | [COMPLETE] | Code Review | - |
| 13.Q | Sprint 13 QA verification | 3 | [COMPLETE] | QA | - |

## Definition of Done

- [x] Every scenario in `advanced-reporting.feature` is covered by a green test.
- [x] Lint, typecheck, unit/integration, coverage ≥ 80 %, build, Prisma validation, audit and browser suites pass.
- [x] Code review LGTM and QA PASS.
- [x] Operator guide gains the new screens (Sprint 13 version).

## Results

- Review: `.project/reviews/sprint-13-code-review.md` — LGTM after three blocking fixes
  (component splits and named constants, the shared `KpiCard` overflow on 360 px, browser
  journeys realigned with the demo fleet and the shared demo state).
- QA: `.project/state/specialists/google-qa-engineer-sprint-13.md` — PASS; 384
  unit/integration tests in 61 files, 85 browser tests, coverage 96.86 % statements /
  86.69 % branches / 96.78 % functions / 97.46 % lines.
- The page journey moved from XE-002 in May 2026 to XE-003 in August 2026 because the demo
  vehicles are created in early August; the feature scenario carries the same figures.
- Blueprint reconciled (`file-blueprint-sprint-13.md`); branch
  `feature/sprint-13-advanced-reporting` builds on Sprint 12.

## Dependencies and Risks

- Builds on Sprint 12 (`feature/sprint-12-operations-finance`); branch `feature/sprint-13-advanced-reporting`.
- No schema change: every report reads existing tables. Reports load the financial contract list
  in memory (as the Sprint 6 and 11 reports do); a database-side aggregate is the scale-out step
  once the contract table grows past what one request should scan (CR-12-06 lineage).
- Utilisation counts whole days by rounding overlaps; hourly rentals shorter than half a day
  round to zero. This matches the day-based price list.
