# Sprint 11 Asset Economics — Code Review

**Reviewer:** google-code-reviewer  
**Date:** 2026-09-18  
**Initial verdict:** NEEDS MINOR  
**Re-review verdict:** LGTM

## Measurement Pass

- **M1 — file length:** 26 changed and 66 new files under `app/` (TypeScript/TSX/SQL). No
  TypeScript file exceeds the 300-line gate (blank lines and comments excluded). Largest new
  production files: `@rental/contracts/economics.ts` 268, `fleet-economics.policy.ts` 173,
  `prisma-economics.repository.ts` 148, `economics-presentation.ts` 159 (raw), `expense-presentation.ts` 140 (raw).
- **M2 — function length:** the 30-line gate passes for every production file. Eleven admin
  components and hooks were split during the review to get there (CR-11-01).
- **M3 — duplicate scan:** depreciation math has one home (`depreciationAt`, `monthsBetween`,
  `addMonths` in `@rental/contracts`), reused by the API report, the workbook export, the
  admin acquisition preview and every test; break-even and recovered-percent math has one home
  (`breakEvenProjection`, `recoveredPercent`); revenue attribution has one home
  (`fleet-economics.policy.ts`); expense totals and reversal rules have one home
  (`expense.policy.ts`); fleet select options have one home (`vehicleOptions`).
- **M4 — drift:** the blueprint listed an `ExpenseForm.tsx` that was never needed because
  `LifecycleFormDialog` already owns the form element; the blueprint was reconciled to the
  files that exist (CR-11-04). No stale route, dictionary key or preview page.
- **M5 — installed gates:** `max-lines`, `max-lines-per-function`, `max-params`,
  `complexity`, `no-magic-numbers`, `naming-convention`, `react/no-multi-comp`, the
  relative-import ban, the frontend architecture Vitest gate and the i18n parity test all run
  and pass with zero warnings.

## Findings

### CR-11-01 — Admin components and hooks exceeded the function-length gate (blocking)

**Severity:** 🟠 Major  
`App` (route table), `ExpenseFilterBar`, `ExpenseAmountFields`, `ExpenseDetailFields`,
`ExpenseReverseDialog`, `VehicleAcquisitionFields`, `useFleetPage`, `VehicleListPage`,
`EconomicsCard`, `EconomicsFooterRows` and `EconomicsTotals` exceeded 30 lines.
**Resolution:** route arrays (`SHARED_PAGES`, `OWNER_PAGES`) mapped inside the guards;
`ExpenseDateFilters` + `ExpenseSelectFilters`; `ExpenseMethodFields` + `ExpenseVehicleField`;
`ExpenseReverseForm`; a `FIELDS` spec mapped to `TextField`; `useFleetDialogs` +
`FleetDialogs`; `economicsCardCells` and `economicsTotalCards` carry the KPI context keys so
the components only render; `EconomicsUnallocatedRow` + `EconomicsTotalRow`. Lint passes with
zero warnings.

### CR-11-02 — Test files broke the length and parameter gates (blocking)

**Severity:** 🟡 Medium  
`tests/domain/asset-economics.test.ts` (395 lines) and `tests/api/asset-economics.test.ts`
(324 lines) exceeded `max-lines`, and the `it.each` callbacks of the depreciation and
break-even outlines took five positional parameters (`max-params`).
**Resolution:** the report and workbook coverage moved to `tests/domain/fleet-economics.test.ts`
and `tests/api/fleet-economics.test.ts`; outlines use object rows with `$field` titles. Unused
fixtures (`RETURN_AT`, `ACTOR`) were removed.

### CR-11-03 — Fleet economics KPI grid overflowed at 360 px (blocking)

**Severity:** 🟠 Major  
The axe/overflow sweep reported 34 px of horizontal overflow on `/reports/fleet` at phone
width: two `KpiCard` columns could not hold `24.000.000 ₫` at `text-3xl`, and grid items
default to `min-width: auto`.
**Resolution:** the totals grid stacks on phones (`grid gap-3 sm:grid-cols-2 lg:grid-cols-4`);
the vehicle cards already stacked. The sweep is 30/30 across both viewports.

### CR-11-04 — Blueprint listed a file that was never needed (non-blocking, reconciled)

**Severity:** 🟢 Minor  
`components/form/ExpenseForm.tsx` duplicated what `LifecycleFormDialog` already provides
(form element, submit handling, pending state, cancel label). The dialog composes the field
groups directly. `file-blueprint-sprint-11.md` now lists the files as built.

### CR-11-05 — Revenue attribution is accrual by contract line (accepted, documented)

**Severity:** 🟢 Minor  
The report attributes a line's `finalSubtotalVnd` plus its charges at the line's start day,
regardless of cash collected; the Sprint 6 revenue report is cash by business day. Both are
correct for their purpose and the operator guide says which to read for what. Delivery fees
and contract-level charges cannot be attributed to one vehicle and are shown as an explicit
"Chưa phân bổ" row and KPI context rather than dropped silently.

### CR-11-06 — Straight-line depreciation only (accepted, PD-16)

**Severity:** 🟢 Minor  
`depreciationAt` floors the monthly amount and caps accumulated depreciation at
`price − salvage`; no declining-balance method. Recorded as PD-16 pending Product Owner
confirmation.

## Passed Areas

- **Authorization:** acquisition upsert, expense reversal, the economics report and its
  export are `@Roles('OWNER')` at the API; the admin only hides the affordances. Staff receives
  403 in the API test and the browser journey. CSRF applies to every mutation.
- **Immutability (BR-09):** expenses have no update or delete path; a reversal is a new row
  with `reversalOfId`, a reversal cannot be reversed and an expense can be reversed once
  (409 both ways). Idempotent replay returns the original row without a second audit entry.
- **Audit:** `VEHICLE_ACQUISITION_SET` records before/after price and useful life;
  `EXPENSE_RECORDED` and `EXPENSE_REVERSED` record amount, category/reason, method and vehicle
  code; the audit page renders the new actions and entity types in both locales.
- **Money:** integer VND everywhere; `Math.floor` for the monthly charge and recovered
  percent, `Math.ceil` for months to break-even; the workbook writes numbers, not strings.
- **Time:** `paidOn`, `purchasedOn` and `asOf` are business-day keys in Asia/Ho_Chi_Minh;
  `monthsBetween` counts whole months by day-of-month; the trailing 90-day window is
  evaluated on the same keys in the API and the domain tests.
- **Frontend architecture:** hooks only under `hooks/`, no state hooks in `.tsx`, one component
  per file, absolute imports, `LifecycleFormDialog` / `LifecycleDialogShell` reused for all
  three dialogs, one idempotency key per dialog instance.
- **Accessibility:** salvage error is `role="alert"`, the acquisition trigger carries the
  vehicle code in its `aria-label`, the recovered progress bar has a label, the report tab
  strip is a `nav` with `aria-current="page"`, the table container is a focusable region.

## Final verification

- Format check, lint (zero warnings), strict typecheck (contracts + api + admin).
- 292 unit/integration tests in 44 files; coverage 96.02 % statements / 85.02 % branches /
  95.84 % functions / 96.82 % lines.
- 71 browser tests (65 baseline + 2 asset-economics journeys + 4 sweep checks) — see the QA
  note for the flake observed on the first full run.
- Production build, Prisma schema validation, `npm audit` 0 vulnerabilities.
