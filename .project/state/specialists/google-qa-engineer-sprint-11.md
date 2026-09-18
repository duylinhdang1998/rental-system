# Specialist Task State — google-qa-engineer Sprint 11

**Status:** COMPLETE
**Date:** 2026-09-18
**Skills Used:** google-qa-engineer, qa-testing, bdd, playwright, axe-core, vitest

## Scenario coverage

`.project/scenarios/sprint-11/asset-economics.feature` — 16 scenarios (three outlines).

| Scenario | Evidence |
|---|---|
| Straight-line depreciation is derived from the acquisition record (outline) | `tests/domain/asset-economics.test.ts`: 30 000 000 / 36 months / salvage 3 000 000 → monthly 750 000; as of 2026-01-14 → 0 months, book 30 000 000; 2026-02-15 → 1 month; 2026-09-18 → 8 months, accumulated 6 000 000, book 24 000 000; 2029-06-30 → capped at 27 000 000, book 3 000 000 |
| The Owner records a vehicle acquisition and the change is audited | `tests/api/asset-economics.test.ts`: PUT → 200 with the record, GET returns `{acquisition, vehicleId}`, `VEHICLE_ACQUISITION_SET` carries `beforePriceVnd` null → 30 000 000 and `usefulLifeMonths` 36; second PUT records the previous price; Staff → 403; unknown vehicle → 404 |
| Acquisition input is validated (outline) | Domain `vehicleAcquisitionInputSchema`: price 0, salvage above price, life 0 and a malformed day are refused; API → 400 with the field path; admin `acquisitionIssue` mirrors `incomplete` / `salvage` |
| Staff records a vehicle expense and the ledger keeps who, when and how | API: Staff POST → 201 with `recordedByName` "Nguyễn Thị Lan", category, method, `paidOn`, vehicle code; `EXPENSE_RECORDED` audit; list count 1 and totals |
| Replaying an expense with the same idempotency key does not double-record | API: same key twice → same id, count stays 1, one audit entry; different key → second row |
| Expense input is validated | Domain `expenseInputSchema` (amount ≤ 0, description < 3, unknown category, malformed day); API → 400; admin `expenseBlocked` |
| The Owner corrects an expense with a reversal entry, never an edit | API: Owner reversal → 201 mirror row with `reversalOfId`, description "Đảo: Nhập nhầm xe", net drops to 0, `reversedVnd` 250 000, `EXPENSE_REVERSED`; second reversal → 409; reversing a reversal → 409; Staff → 403; no PUT/DELETE route exists |
| The expense list filters by paid day, category and vehicle | API: `from`/`to`, `category=FUEL`, `vehicleId` each narrow the list and the totals; malformed day → 400; domain `matchesExpenseQuery` |
| Revenue is attributed to vehicles from contract lines and line-level charges | `tests/domain/fleet-economics.test.ts`: XE-001 560 000 (line subtotal + late charge − line discount), cancelled contract ignored, replaced line still counted, unallocated 30 000 (delivery fee + contract-level charge) |
| Break-even is derived from cost, cumulative net and the trailing 90-day rate (outline) | Domain `breakEvenProjection`: NO_COST (no price), RECOVERED (net ≥ price), PROJECTED 20 months → 2028-05-18 from trailing net 450 000, NOT_PROJECTABLE when the trailing rate is ≤ 0; `recoveredPercent` clamps 0–100 |
| The fleet economics report reconciles vehicles, expenses and depreciation for the Owner only | `tests/api/fleet-economics.test.ts`: golden report as of 2026-09-18 — XE-001 revenue 560 000, expenses 250 000, net 310 000, recovered 1 %, monthly 750 000, book 24 000 000; unallocated revenue 30 000 / expenses 5 000 000; totals 590 000 / 5 250 000 / −4 660 000; Staff → 403; malformed `asOf` → 400 |
| The fleet economics workbook has one row per vehicle plus totals | API export: `spreadsheetml` content type, `hieu-qua-doi-xe-2026-09-18.xlsx`, sheet "Đội xe" with `XE-001`, "Chưa phân bổ", "Tổng cộng" and "Dự kiến" cells; `@ThrottlePolicy('export')` |
| The Owner records cost and expenses and reads the fleet economics page | `e2e/asset-economics.spec.ts` Owner journey: "Giá vốn xe XE-001" dialog → salvage alert → preview 750.000 → save; "Ghi chi phí" 250 000 on XE-001; "Đảo" → "Đã đảo" + mirror row "Bút toán đảo" −250.000 and no second "Đảo"; `/reports/fleet` totals, XE-001 row 30.000.000 / 750.000, unallocated and total rows, export link downloads `hieu-qua-doi-xe-`; tab "Doanh thu" opens the revenue report |
| Staff records an expense but never sees a reversal button or the economics report | e2e Staff journey: no "Giá vốn" button on `/vehicles`; records a vehicle-less expense shown as "Không gắn xe"; no "Đảo" button; `/reports/fleet` shows "Bạn không có quyền xem trang này"; API → 403 |
| `/expenses` and `/reports/fleet` pass the accessibility and overflow sweep | `e2e/release-accessibility.spec.ts`: 14 routes × 2 viewports (360/1280): axe WCAG 2.2 AA no serious/critical, one `h1`, no horizontal overflow — 30/30 after CR-11-03 |
| Navigation shows "Chi phí" to both roles and keeps `/reports/fleet` Owner-only | `tests/admin/navigation.test.tsx` (Staff and Owner lists include `/expenses`), `e2e/workspace-navigation.spec.ts` Owner-only loop includes `/reports/fleet` |

Admin presentation rules (`tests/admin/economics-presentation.test.ts`, 13 tests): acquisition
form → input, salvage/incomplete issues, preview rows, expense blocked rules, signed reversal
amounts, reversibility by role and status, break-even tone and label, row cells with "—" when
no cost basis, KPI contexts, sorted rows, `asOf` issue.

## Regression and side effects

- Vehicle list gained an extra Owner-only column and card button; the Sprint 2 fleet, the
  frontend-remediation overlay tests and the 360 px fleet checks still pass.
- Revenue report page gained the tab strip; the Sprint 6 report journey and the `/reports`
  sweep still pass.
- Audit page renders three new actions and two new entity types; the i18n parity test keeps
  both dictionaries aligned.
- Prisma infrastructure tests cover the new repository (`prisma-sprint11.repositories.test.ts`)
  without a database.
- First full browser run: 69/71. `/reports/fleet` at 360 px overflowed by 34 px (fixed,
  CR-11-03). `employee-audit.spec.ts` timed out once waiting for the "Thêm nhân viên" dialog
  to close while the argon2 hash ran under four parallel workers; unchanged test, passes on
  the rerun (3/3) and on the final full run.

## Final verification

- Format check, lint (zero warnings), strict typecheck (contracts + api + admin).
- 292 unit/integration tests in 44 files; coverage 96.02 % statements / 85.02 % branches /
  95.84 % functions / 96.82 % lines (gate 80 %).
- 71 browser tests pass on the final full run (Chromium, 360 px and 1280 px).
- Production build, Prisma schema validation, `npm audit` 0 vulnerabilities.
- No private client rows in any fixture, screenshot or log; demo data only.

**Verdict:** QA PASS for Sprint 11.
