# Specialist Task State — google-qa-engineer Sprint 13

**Status:** COMPLETE
**Date:** 2026-09-18
**Skills Used:** google-qa-engineer, qa-testing, bdd, playwright, axe-core, vitest

## Scenario coverage

`.project/scenarios/sprint-13/advanced-reporting.feature` — 14 scenarios (three outlines).

| Scenario | Evidence |
|---|---|
| Revenue events are accrued once and every dimension reconciles to the same total | `tests/domain/analytics.test.ts`: four-day contract 520 000 + delivery 30 000 + OTHER 40 000 − DISCOUNT 20 000 → totals 570 000 / 4 days / 1 contract; byType SCOOTER 560 000 (98 %) + "Chưa phân bổ" 10 000 (1 %); byVehicle XE-001 560 000; byNationality VN 570 000 (100 %); byMonth 2026-09 570 000; a CONFIRMED booking and a cancelled contract yield `[]`; rows sort XE-001, XE-002, unallocated |
| Surcharges are grouped by kind with counts and unsigned amounts | Same file: LATE_RETURN 1 / 40 000, DAMAGE 2 / 330 000, OTHER 1 / 30 000, DISCOUNT 1 / 20 000, net 380 000; a DAMAGE charge created outside the window is ignored |
| Utilisation counts occupied days over available days inside the window (outline) | `tests/domain/utilisation.test.ts`: the four golden rows (3/31 → 9 %, 2/31 → 6 %, 12/16 → 75 %, 0/0 → 0 %) through `utilisationRows` |
| A returned line stops occupying the vehicle at the actual return | Same file: actual return two days in → 2 rented days; a swapped line ends at the replacement start; type row 7/52 → 13 %; fleet row sums every vehicle; bookings are ignored |
| The Owner reads the analytics report and Staff is refused | `tests/api/analytics-report.test.ts`: seeded golden contract → 200 with the full report (byType, byVehicle, byNationality, byMonth, four surcharge rows, utilisation XE-001 4/30 → 13 %, SCOOTER 4/90 → 4 %, fleet); 367 days / reversed range / missing `to` → 400 `INVALID_INPUT`; 366 days → 200; Staff → 403 on both routes; empty January range lists the fleet with 0 available days |
| The analytics workbook carries one sheet per dimension | Same file: `phan-tich-2026-09-01-2026-09-30.xlsx`, `workbook.xml` lists "Loại xe", "Xe", "Quốc tịch", "Tháng", "Phụ phí", "Sử dụng xe"; `[Content_Types].xml` has `sheet6.xml`; sheet 2 holds XE-001, `<v>560000</v>` and "Tổng cộng"; sheet 6 holds "Toàn đội"; the route carries the `export` throttle policy |
| Monthly profit and loss subtracts expenses and straight-line depreciation | `tests/domain/pnl.test.ts`: 2026-09 → −180 000, 2026-08 → −5 450 000, 2025-10 and 2026-01 depreciation 0, 2026-02 first 750 000, totals with 8 × 750 000 depreciation; business-month keying of a 2026-08-31T17:30Z event → 2026-09 |
| The profit and loss query is validated (outline) | Same file: the seven rows of `pnlQuerySchema`; `parse({})` → `{ months: 12 }`; `previousMonth`, `monthEnd`, `monthsEnding`, `monthWindow` |
| The Owner reads and exports the profit and loss | `tests/api/pnl-report.test.ts`: golden contract + acquisition + two expenses → from 2025-10, to 2026-09, 12 rows; 2026-09 `{ 570 000, 250 000, 750 000, −430 000 }`; 2026-08 `{ 0, 5 000 000, 750 000, −5 750 000 }`; totals; default query → 12 rows ending the current business month; `months=6&to=2026-03` → from 2025-10; 400 for months 0 / 25, `to=2026-13`, export `to=2026-9`; Staff 403; export `lai-lo-2025-10-2026-09.xlsx` with sheet "Lãi lỗ", "Khấu hao", `<v>-430000</v>`, "Tổng cộng" |
| The Owner reads the analytics page | `e2e/advanced-reporting.spec.ts` journey 1: XE-003 rented 10–13 August (390 000), returned on time through the API; window 5–31 August → totals 390.000; type row "Xe tay ga"; vehicle row XE-003 390.000 / 100 %; nationality row VN; month row 08/2026; net surcharge row; utilisation XE-003 3/27 / 11 % and "Toàn đội"; chart `role="img"` named "Doanh thu theo tháng…" with one point; "Xuất Excel" → `/api/reports/analytics/export?from=2026-08-05&to=2026-08-31`, download is a `spreadsheetml` file named `phan-tich-2026-08-05-2026-08-31` |
| The range form refuses more than 366 days before any request is sent | Journey 2: 2025-01-01 → 2026-09-18 shows the alert "Báo cáo tối đa 366 ngày", the export button is disabled and no `/api/reports/analytics?from=2025-01-01` request is observed |
| The Owner reads the twelve-month profit and loss with the trend chart | Journey 3: expense 9 000 000 paid 2026-03-15 → heading "Lãi lỗ theo tháng", "Số tháng" shows "12 tháng", 13 table rows (12 months + total), March row shows 9.000.000 and a true minus sign, chart named "Xu hướng 12 tháng…" with 12 points per series, legend "Lãi lỗ", "Xuất Excel" → `/api/reports/pnl/export?months=12&to=…` downloads `lai-lo-…`; choosing "6 tháng" → 6 points and 7 rows |
| The chart geometry is pure and handles empty, flat and negative series (outline) | `tests/admin/analytics-presentation.test.ts`: the four rows (zeroY 200 / 200 / 200 / 120, firstY 200 / 200 / 120 / 200) plus x positions 64 / 324 / 584, path `M64 200 L324 40 L584 120`, ticks `[0, 200000, 400000]`, nice steps, 13 labels thinned to 7, single point centred |
| Staff cannot open the analytics or profit and loss pages | Journey 4: Staff → "Bạn không có quyền xem trang này" on both routes and 403 from `/api/reports/pnl`; `e2e/workspace-navigation.spec.ts` Staff-denied loop includes both routes; `e2e/release-accessibility.spec.ts`: login + 17 routes × 2 viewports (360/1280): axe WCAG 2.2 AA no serious/critical, one `h1`, no horizontal overflow — 36/36 |

Admin presentation rules: `tests/admin/analytics-presentation.test.ts` (default range one year
back, range issue, dimension / month / surcharge cells with a true minus sign, utilisation row
order and emphasis, KPI cards, month series, P&L defaults, issue, month options, row / total
cells, cards and series).

## Regression and side effects

- The page journey in the feature file was written for XE-002 in May 2026; the demo vehicles
  are created on 2–4 August 2026, so a May window has 0 available days. The scenario and the
  journey were moved to XE-003 in August (3/27 days, 11 %), a window no other spec touches
  (the return-settlement journey rents XE-001 / XE-002 on 1–3 August).
- The first journey draft left XE-003 rented, and the Sprint 4 swap journey
  (`contract-lifecycle.spec.ts`, which runs after it) timed out waiting for XE-003 in the
  replacement list. The journey now returns the line through the API right after seeding
  (`returnContract`), so the shared demo fleet is unchanged for later specs. Specs share one
  demo database in alphabetical order; any seeded active contract must be returned inside the
  same spec.
- The shared `KpiCard` fix (CR-13-02) changes every KPI page; the Sprint 6 and Sprint 11
  report journeys and the `/expenses` journey pass unchanged.
- No schema change and no new write route: the Sprint 11 economics and Sprint 6 payment
  suites pass unchanged; the i18n parity test keeps both dictionaries aligned for the two new
  pages.
- First full browser run: 80/85. It was started while the Vitest coverage run and the
  production build were executing, so the four timeouts (employee audit, workspace
  navigation, contract lifecycle) were load-induced; rerun alone, only the swap journey
  failed (the XE-003 state above) and the `/expenses` phone sweep exposed the KPI overflow.
  Vitest itself reported 11 worker timeouts under the same load and passed 61/61 files when
  run alone. Rule recorded: never run Vitest and Playwright concurrently.
- Second and third full runs alone: 84/85 and 83/85, each failing a different Sprint 1 / 7
  spec on the 5 s default expectation timeout (the created employee's row, the login alert,
  the dashboard heading after sign-in) while the shared dev API hashed passwords and served
  another worker's photo upload or workbook export. Every spec passes alone. The Playwright
  config now sets `expect.timeout` to 15 s (the per-test budget stays 90 s) and the employee
  journey waits 20 s for its row; no product change. The final full run is 85/85.

## Final verification

- Format check, lint (zero warnings), strict typecheck (contracts + api + admin).
- 384 unit/integration tests in 61 files; coverage 96.86 % statements / 86.69 % branches /
  96.78 % functions / 97.46 % lines (gate 80 %).
- 85 browser tests pass (Chromium, 360 px and 1280 px) on the final run with nothing else
  executing.
- Production build, Prisma schema validation, `npm audit` 0 vulnerabilities.
- No private client rows in any fixture, workbook or log; demo data only, synthetic amounts.

**Verdict:** QA PASS for Sprint 13.
