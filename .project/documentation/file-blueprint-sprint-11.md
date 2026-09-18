# Sprint 11 Exact File Blueprint — Asset Economics

**Status:** RECONCILED with the implementation after code review (2026-09-18)  
**Architecture:** One new NestJS module `economics` (expenses, vehicle acquisitions and the
fleet economics report) over the existing contract and fleet ports, with demo and Prisma
repositories like every other module. Depreciation math lives in `@rental/contracts` so the
admin acquisition dialog previews exactly what the API reports. Revenue attribution reads the
contract snapshots already in the contract repository; nothing in the payment ledger is
touched (expenses are a separate append-only ledger, BR-09). Reporting stays Owner-only at
the API (BR-08).

## Shared contracts

```text
app/packages/contracts/src/
├── economics.ts                            # vehicleAcquisitionInputSchema/Schema, depreciationAt, monthsBetween,
│                                           # expenseCategorySchema (8 categories), expenseInputSchema, expenseSchema,
│                                           # expenseReversalInputSchema, expenseListQuerySchema, expenseListSchema,
│                                           # breakEvenStatusSchema, breakEvenProjection, fleetEconomicsQuerySchema,
│                                           # fleetEconomicsRowSchema, fleetEconomicsReportSchema, FLEET_ECONOMICS_COLUMNS
└── index.ts                                # + export * from './economics.js'
```

## Backend — persistence

```text
app/apps/api/prisma/
├── schema.prisma                           # enum ExpenseCategory; model VehicleAcquisition (vehicleId PK, price, purchasedOn, usefulLifeMonths, salvage, updatedById);
│                                           # model Expense (idempotencyKey unique, category, amount, method, paidOn, description, reference, notes, vehicleId?, recordedById, reversalOfId? unique self-relation)
└── migrations/202609180001_asset_economics/migration.sql
```

## Backend — economics module

```text
app/apps/api/src/modules/economics/
├── economics.tokens.ts                     # ECONOMICS_REPOSITORY
├── economics.types.ts                      # ExpenseDraft, ExpenseRecord, AcquisitionRecord, EconomicsRepository port
├── demo-economics.repository.ts            # In-memory acquisitions and expense ledger (append-only, reversal link)
├── prisma-economics.repository.ts          # Prisma adapter: upsert acquisition, create expense (P2002 → CONFLICT), list with filters
├── expense.policy.ts                       # expenseTotals (cash / transfer / reversed / net / by category), matchesExpenseQuery, reversalDraft, expenseView
├── expense.service.ts                      # record (idempotent replay, vehicle lookup 404), reverse (Owner, 409 rules), list (+ recordedByName); audit EXPENSE_RECORDED / EXPENSE_REVERSED
├── vehicle-acquisition.service.ts          # get / set (404 vehicle, audit VEHICLE_ACQUISITION_SET before/after price)
├── fleet-economics.policy.ts               # vehicleRevenue attribution (activated contracts, all lines, line charges), unallocated revenue, trailing window, economicsRow
├── fleet-economics.service.ts              # report(asOf): vehicles × acquisitions × contracts × expenses → FleetEconomicsReport
├── fleet-economics-export.service.ts       # "Đội xe" sheet: header, vehicle rows, unallocated row, totals row; exportFileName
├── expense.controller.ts                   # GET /api/expenses, POST /api/expenses (CSRF), POST /api/expenses/:id/reversal (Owner + CSRF)
├── vehicle-acquisition.controller.ts       # GET /api/fleet/vehicles/:id/acquisition, PUT … (Owner + CSRF)
├── fleet-economics.controller.ts           # GET /api/reports/fleet-economics, GET …/export (Owner; export throttle policy)
└── economics.module.ts                     # register(environment, contracts): providers by DEMO_MODE, imports contracts module instance
app/apps/api/src/app.module.ts              # + EconomicsModule.register(environment, contracts)
```

## Admin — expenses feature

```text
app/apps/admin/src/features/expenses/
├── index.ts                                # ExpenseListPage
├── api/expense-api.ts                      # fetchExpenses(filters), recordExpense, reverseExpense
├── hooks/use-expenses.ts                   # useExpenses(filters), useRecordExpense, useReverseExpense (invalidate 'expenses' + 'fleet-economics')
├── hooks/use-expense-form.ts               # one idempotency key per dialog instance; blocked() mirrors the schema
├── hooks/use-expense-page.ts               # filters in search params, dialog state, reversal target
├── lib/expense-presentation.ts             # initialExpenseForm, toExpenseInput, expenseBlocked, expenseQueryFrom, signedExpenseAmount, expenseStatus, expenseReversible, vehicleOptions
├── lib/expense-translations.ts             # vi/en keys (expense*, expenseCategory.*)
├── pages/ExpenseListPage.tsx
├── components/list/ExpenseHeader.tsx       # title, subtitle, "Ghi chi phí" button
├── components/list/ExpenseSummary.tsx      # KPI cards: net, cash, transfer, reversed
├── components/list/ExpenseList.tsx         # table ≥ sm, cards < sm
├── components/list/ExpenseTable.tsx
├── components/list/ExpenseTableRow.tsx
├── components/list/ExpenseCard.tsx
├── components/list/ExpenseStatusBadge.tsx  # "Đã đảo" / "Bút toán đảo"
├── components/list/ExpenseReverseButton.tsx# Owner-only, originals only
├── components/filters/ExpenseFilterBar.tsx # form shell + reset
├── components/filters/ExpenseDateFilters.tsx # from / to
├── components/filters/ExpenseSelectFilters.tsx # category / vehicle
├── components/form/ExpenseCreateDialog.tsx # LifecycleFormDialog composing the field groups (no separate ExpenseForm)
├── components/form/ExpenseMethodFields.tsx # category, method
├── components/form/ExpenseAmountFields.tsx # amount (autofocus), paid day
├── components/form/ExpenseVehicleField.tsx # select over the fleet list ("Không gắn xe" first)
├── components/form/ExpenseDetailFields.tsx # description, reference, notes
├── components/form/ExpenseReverseDialog.tsx# LifecycleDialogShell
└── components/form/ExpenseReverseForm.tsx  # reason field, destructive confirm
```

## Admin — fleet acquisition and economics report

```text
app/apps/admin/src/features/fleet/
├── api/fleet-api.ts                        # + fetchAcquisition, saveAcquisition
├── hooks/use-vehicle-acquisition.ts        # query per vehicle + mutation (invalidate 'acquisition', 'fleet-economics')
├── hooks/use-acquisition-form.ts           # form state, preview via depreciationAt, blocked()
├── lib/acquisition-presentation.ts         # INITIAL_ACQUISITION_FORM, acquisitionFormFrom, toAcquisitionInput, acquisitionIssue, acquisitionPreview
├── lib/acquisition-translations.ts         # vi/en keys (acquisition*)
├── components/acquisition/VehicleAcquisitionDialog.tsx
├── components/acquisition/VehicleAcquisitionForm.tsx
├── components/acquisition/VehicleAcquisitionFields.tsx
├── components/acquisition/AcquisitionPreview.tsx
├── components/list/VehicleAcquisitionButton.tsx # Owner-only trigger in row and card
├── components/list/FleetDialogs.tsx        # mounts create / calendar / acquisition dialogs
├── hooks/use-fleet-dialogs.ts              # calendarOpen, formOpen, calendarFrom, acquisitionTarget
├── components/list/VehicleTableRow.tsx     # + button column (Owner)
├── components/list/VehicleCard.tsx         # + button (Owner)
├── components/list/VehicleTable.tsx        # + header cell
├── hooks/use-fleet-page.ts                 # returns { dialogs, filters, fleet, update }
└── pages/VehicleListPage.tsx               # + dialog mount

app/apps/admin/src/features/reporting/
├── index.ts                                # + FleetEconomicsPage
├── api/report-api.ts                       # + fetchFleetEconomics(asOf), fleetEconomicsExportUrl(asOf)
├── hooks/use-fleet-economics.ts
├── hooks/use-fleet-economics-page.ts       # asOf state (default today), issue mirror
├── lib/economics-presentation.ts           # asOfIssue, breakEvenTone/labelKey, economicsRowCells, totalsCards, formatting helpers
├── lib/economics-translations.ts           # vi/en keys (economics*, breakEven.*)
├── pages/FleetEconomicsPage.tsx
├── components/layout/ReportTabs.tsx        # "Doanh thu" | "Đội xe" links (used by both report pages)
├── components/economics/EconomicsHeader.tsx
├── components/economics/EconomicsAsOfForm.tsx
├── components/economics/EconomicsBody.tsx  # loading / error / empty / totals + table + cards
├── components/economics/EconomicsTotals.tsx # KPI cards (1 column < sm, 2 < lg, 4 ≥ lg)
├── components/economics/EconomicsTable.tsx # ≥ sm
├── components/economics/EconomicsRow.tsx
├── components/economics/EconomicsFooterRows.tsx
├── components/economics/EconomicsUnallocatedRow.tsx
├── components/economics/EconomicsTotalRow.tsx
├── components/economics/EconomicsCardList.tsx # < sm
├── components/economics/EconomicsCard.tsx
└── components/economics/BreakEvenBadge.tsx

app/apps/admin/src/
├── App.tsx                                 # + /expenses (both roles), /reports/fleet (Owner)
├── shared/navigation/routes.ts             # + Chi phí (Receipt icon) after Công nợ
├── shared/i18n/i18n.ts                     # + acquisition, economics and expense dictionaries
├── features/audit/lib/audit-presentation.ts # + EXPENSE_RECORDED, EXPENSE_REVERSED, VEHICLE_ACQUISITION_SET; entity Expense, VehicleAcquisition
└── features/audit/lib/audit-translations.ts # + action / entity / meta labels (vi, en)
```

## Tests

```text
app/tests/domain/asset-economics.test.ts            # depreciation outline, acquisition validation outline, expense totals / filters / reversal policy
app/tests/domain/fleet-economics.test.ts            # revenue attribution, break-even outline, economics row / totals, trailing window
app/tests/api/asset-economics.test.ts               # acquisition set/get/audit/403/404, expense record/replay/validate/filters, reversal rules
app/tests/api/fleet-economics.test.ts               # golden report figures, Staff 403, malformed asOf, export workbook
app/tests/infrastructure/prisma-sprint11.repositories.test.ts # upsert acquisition, create expense (P2002 → CONFLICT), where(filters), mapping
app/tests/admin/economics-presentation.test.ts     # form → input, blocked rules, preview rows, break-even tone, row cells, asOf issue, signed amounts
app/tests/admin/navigation.test.tsx                # + /expenses visible to Staff, /reports/fleet route is Owner-only
app/e2e/asset-economics.spec.ts                    # Owner journey (cost → expense → reversal → economics page) and Staff journey
app/e2e/release-accessibility.spec.ts              # + /expenses, /reports/fleet
app/e2e/workspace-navigation.spec.ts               # + /reports/fleet in the Owner-only loop
```

## Rules carried into code

- Depreciation: `monthly = floor((price − salvage) / usefulLifeMonths)`; `monthsElapsed` counts
  whole months from `purchasedOn` to `asOf` (the same day-of-month or later counts the month);
  `accumulated = min(monthly × monthsElapsed, price − salvage)`; `bookValue = price − accumulated`.
- Revenue attribution: contracts with `activatedAt` and status ≠ CANCELLED; every line
  (replaced lines included, they earned before the swap) whose `startAt` is on or before the
  `asOf` day end; line revenue = `finalSubtotalVnd` + line charges (LATE_RETURN, DAMAGE, OTHER)
  − line DISCOUNT; unallocated = delivery fees + contract-level charges − contract-level
  discounts.
- Break-even: `NO_COST` without an acquisition or with price 0; `RECOVERED` when net ≥ price;
  otherwise the trailing 90-day net (line revenue by `startAt`, charges by `createdAt`,
  expenses by `paidOn`) × 30 / 90 is the monthly rate; `PROJECTED` with
  `ceil((price − net) / rate)` months when the rate is positive, else `NOT_PROJECTABLE`.
  `recoveredPercent = clamp(floor(net × 100 / price), 0, 100)`.
- Expenses: amounts are positive; a reversal is a new row with the same amount, category,
  method, vehicle and paid day, `reversalOfId` set and description "Đảo: <reason>"; net =
  originals − reversals; only the Owner reverses; an expense can be reversed once and a
  reversal cannot be reversed.
