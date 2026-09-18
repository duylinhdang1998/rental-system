# Sprint 13 Advanced Reporting — Code Review

**Reviewer:** google-code-reviewer  
**Date:** 2026-09-18  
**Initial verdict:** NEEDS MINOR  
**Re-review verdict:** LGTM

## Measurement Pass

- **M1 — file length:** 15 changed and 58 new files under `app/` (TypeScript/TSX). No
  TypeScript file exceeds the 300-line gate (blank lines and comments excluded). Closest:
  `shared/i18n/i18n.ts` 284 (two more dictionaries registered), `finance/xlsx-writer.ts` 257
  after `encodeSheets` was added, `tests/admin/analytics-presentation.test.ts` 248.
- **M2 — function length:** the 30-line gate passes for every production file after the
  chart, table and P&L components were split (CR-13-01). No function exceeds complexity 10;
  the analytics service delegates the three dimension tables to one `breakdowns()` helper.
- **M3 — duplicate scan:** revenue accrual has one home (`revenue-events.policy.ts`; the
  type, vehicle, nationality and month tables and the P&L revenue line all group the same
  events); month arithmetic has one home (`monthKey` / `previousMonth` / `monthEnd` /
  `monthsEnding` in `@rental/contracts`, used by the API, the admin and the tests);
  depreciation reuses the Sprint 11 `depreciationAt`; the workbook writer gained one
  multi-sheet encoder and `encodeWorkbook` delegates to it; the two report pages share
  `ReportTabs`, `ReportRangeForm`, `KpiCard`, `TrendChart` and `AnalyticsHeader`
  (`titleKey` / `subtitleKey`); chart geometry is one pure function reused by the month chart
  and the P&L trend.
- **M4 — drift:** the draft blueprint listed `charts/TrendTable.tsx` and `pnl/PnlHeader.tsx`
  (never built: the month and P&L tables already are the table fallback and the analytics
  header is shared); the code gained the split sub-components under `charts/`, `analytics/`
  and `pnl/`, `filters/RangeIssueAlert.tsx`, `e2e/support/expenses.ts` and the
  `returnContract` helper. The blueprint was reconciled to the files that exist (CR-13-04).
  No stale route, dictionary key or tab.
- **M5 — installed gates:** `max-lines`, `max-lines-per-function`, `max-params`,
  `complexity`, `no-magic-numbers`, `naming-convention`, `react/no-multi-comp`, the
  relative-import ban, the frontend architecture Vitest gate and the i18n parity test all run
  and pass with zero warnings.

## Findings

### CR-13-01 — Chart, table and P&L components exceeded the function-length and magic-number gates (blocking)

**Severity:** 🟠 Major  
The first lint run reported 16 errors: `TrendChart`, `DimensionTable`, `MonthSection`,
`SurchargeTable`, `UtilisationTable`, `PnlBody`, `PnlTable`, `PnlForm` and
`ReportRangeForm` exceeded 30 lines, and geometry, formatting and month parsing used unnamed
numbers.
**Resolution:** the chart was split into `ChartGrid` / `ChartTick` / `ChartLines` /
`ChartAxisLabels` / `ChartLegend`; the tables into `ShareCell`, `DimensionRowItem`,
`MonthTable`, `SurchargeRows` and `UtilisationRowItem`; the P&L page into
`PnlTrendSection`, `PnlCard` and `PnlTableRows`; the range message into `RangeIssueAlert`.
Row shaping moved to pure helpers (`utilisationTableRows`, `pnlMonthOptions`) and every
number is a named constant (`HALF_DECADE`, `POINT_RADIUS`, `TICK_LABEL_GAP`, `DAY_LENGTH`,
`YEAR_DIGITS` / `MONTH_DIGITS`). Lint passes with zero warnings.

### CR-13-02 — Eight-digit KPI values overflowed the two-column phone grid (blocking)

**Severity:** 🟡 Medium  
The accessibility and overflow sweep failed on `/expenses` at 360 px once a 9 000 000 VND
expense existed: `9.120.000 ₫` in a `KpiCard` next to a sibling card pushed the page 12 px
wider than the viewport. The Sprint 11 fix had widened the grid but not the card, so every
KPI page (`/reports`, `/reports/fleet`, `/expenses` and the two new pages) had the same
latent defect.
**Resolution:** the shared `KpiCard` now uses `min-w-0` on the article, `shrink-0` on the
icon and `break-words` on the value with a comment explaining the 360 px case. The sweep
passes at both viewports on every route.

### CR-13-03 — Browser journeys out of step with the demo fleet and the shared demo state (blocking)

**Severity:** 🟡 Medium  
The feature file placed the analytics page journey on XE-002 in May 2026, but the demo
vehicles are created on 2–4 August 2026, so their available days before August are 0 and
the utilisation row could never show 3/31. The first journey draft also left an active
contract on XE-003, which removed XE-003 from the replacement list of the Sprint 4 swap
journey (`contract-lifecycle.spec.ts` ran after it and timed out), and the P&L export
assertion expected `?to=…&months=` although the client sorts query keys.
**Resolution:** the journey now rents XE-003 from 10 to 13 August and reads the window
5–31 August (3/27 days, 11 %), returns the line through the API right after seeding
(`returnContract` in `e2e/support/contracts.ts`) so the shared demo fleet is unchanged for
later specs, and asserts `?months=12&to=`. The feature scenario was updated to the same
figures. Both specs pass in file order with one worker and inside the full run.

### CR-13-04 — Blueprint drift (non-blocking, reconciled)

**Severity:** 🟢 Minor  
`TrendTable.tsx` and `PnlHeader.tsx` were never needed; the split components, the
`RangeIssueAlert`, the `PnlQueryState` type in `report-api.ts`, the `breakdowns()` helper,
`utilisationTableRows`, `pnlMonthOptions` and the two browser helpers were added.
`file-blueprint-sprint-13.md` lists the files as built and records the drift.

### CR-13-05 — Reports scan the financial contract list in memory (accepted)

**Severity:** 🟢 Minor  
`AnalyticsService` and `PnlService` list every financial contract, every expense and every
acquisition and filter in memory by the window, as the Sprint 6 and Sprint 11 reports do
(CR-12-06 lineage). Acceptable at shop scale and it keeps one implementation of the
revenue-event rule; a database-side aggregate is the scale-out step once the contract table
grows past what one request should scan.

### CR-13-06 — Utilisation goldens couple to the demo seed dates (accepted, documented)

**Severity:** 🟢 Minor  
`availableDays` starts at the vehicle's creation day, so the API goldens (XE-001 4/30 in
September, fleet 4/90) and the browser figures (3/27 in August) depend on the demo vehicles
being created in early August 2026. The rule is the product rule (a vehicle bought
mid-window is only available from that day); the coupling is recorded in the test headers
and in the QA note so a future seed change is understood rather than debugged.

## Passed Areas

- **Authorization:** both controllers carry `AuthenticationGuard` and
  `OwnerAuthorizationGuard` at class level, so the guard runs before any query is parsed;
  Staff receives 403 on the report and export routes in the API tests and the browser
  journey; the admin only hides the tabs and routes.
- **Money:** integer VND throughout; discounts enter the revenue events as negative amounts
  once and every dimension groups those events, so the four tables and the month table
  reconcile to one total (asserted in `tests/domain/analytics.test.ts`); surcharge rows are
  unsigned with a signed net; negative profit renders with a true minus sign
  (`signedCurrency`).
- **Time:** the analytics window is the Sprint 6 `ReportWindow` (business-day bounds in
  Asia/Ho_Chi_Minh, UTC timestamps) capped at 366 days on both sides; month keys come from
  the business day of each event; depreciation counts a month once its day-of-month is
  reached, so a 15 January purchase first depreciates in February; the P&L defaults to the
  current business month.
- **Immutability (BR-07 / BR-09):** the module is read-only, adds no table, migration or
  write route, and reads the same repositories the ledgers already expose.
- **Exports:** `encodeSheets` writes N worksheets with matching `workbook.xml`,
  `[Content_Types].xml` and relationship entries; sheet names and numeric cells are verified
  from the ZIP in the API tests; both exports use the `export` throttle policy; file names
  carry only the range.
- **Frontend architecture:** hooks only under `hooks/`, no state hooks in `.tsx`, one
  component per file, absolute imports, react-query keys include the whole query, no request
  is issued for an invalid range (`enabled` follows `rangeIssue`), chart geometry is pure
  and unit-tested (empty, flat, negative, 13-label thinning) with no chart library (US-030).
- **Accessibility:** each chart is `<svg role="img">` with a Vietnamese `aria-label`, a
  `<figcaption>` legend and a table of the same figures; the range message is a `role="alert"`;
  the sweep is 36/36 across both viewports including the two new routes.

## Final verification

- Format check, lint (zero warnings), strict typecheck (contracts + api + admin).
- 384 unit/integration tests in 61 files; coverage 96.86 % statements / 86.69 % branches /
  96.78 % functions / 97.46 % lines.
- 85 browser tests (77 baseline + 4 advanced-reporting journeys + 4 sweep checks); see the
  QA note for the first full run.
- Production build, Prisma schema validation, `npm audit` 0 vulnerabilities.
