# Sprint 13 Exact File Blueprint — Advanced Reporting

**Status:** RECONCILED after code review (2026-09-18)  
**Architecture:** One read-only `analytics` module over the existing ports. It imports the same
contract, customer and economics module instances the application registered and the global
fleet module, so every figure comes from the ledgers that already exist (BR-07 / BR-09: nothing
is copied or stored twice). Revenue is accrued once into *revenue events* (line subtotal at the
line start, charge at its creation with discounts negative, delivery fee at activation — the
same rule as the Sprint 11 fleet economics report) and every dimension groups the same events, so
the type, vehicle, nationality and month tables reconcile to one total. Utilisation counts the
occupied days of each vehicle inside the window over the days the vehicle existed. The profit and
loss subtracts expenses (by paid day, reversals negative) and straight-line depreciation (the
monthly difference of `depreciationAt`) from the monthly revenue. Charts are inline SVG built from
pure geometry with a table fallback (US-030, no chart library).

## Shared contracts

```text
app/packages/contracts/src/
├── analytics.ts                            # MAX_ANALYTICS_DAYS = 366, MAX_TREND_MONTHS = 24, DEFAULT_TREND_MONTHS = 12, MONTH_PATTERN,
│                                           # UNALLOCATED_KEY; dimensionRowSchema, monthRowSchema, surchargeRowSchema, utilisationRowSchema,
│                                           # utilisationSchema, analyticsTotalsSchema, analyticsReportSchema; pnlQuerySchema, pnlMonthSchema,
│                                           # pnlTotalsSchema, pnlReportSchema; monthKey, formatMonth, previousMonth, monthEnd, monthsEnding,
│                                           # sharePercent, utilisationPercent; ANALYTICS_SHEETS (six sheet names + columns), PNL_COLUMNS
└── index.ts                                # + analytics
```

## Backend — analytics module

```text
app/apps/api/src/modules/analytics/
├── analytics-window.ts                     # analyticsWindow(range): same shape as ReportWindow, 366-day limit, windowDays
├── revenue-events.policy.ts                # RevenueEvent; revenueEvents(contracts, vehiclesById); eventsInWindow(events, window)
├── analytics.policy.ts                     # dimensionRows(events, keyOf/labelOf), monthRows, surchargeRows, analyticsTotals
├── utilisation.policy.ts                   # occupiedIntervals(contracts), utilisationRows(vehicles, intervals, window), utilisationByType, fleetUtilisation
├── analytics.service.ts                    # report(range): loads contracts, vehicles, types, customers; nationality per contract; breakdowns() builds the three dimension tables
├── analytics-export.service.ts             # six sheets; file name phan-tich-<from>-<to>.xlsx
├── analytics.controller.ts                 # GET /api/reports/analytics, GET /api/reports/analytics/export (class-level Owner guard, export throttle)
├── pnl.policy.ts                           # monthlyRevenue(events), monthlyExpenses(expenses), monthlyDepreciation(acquisitions, month), pnlMonths, pnlTotals, monthWindow
├── pnl.service.ts                          # report(query, now): months ending `to` (default current business month), 12 by default
├── pnl-export.service.ts                   # sheet "Lãi lỗ" + total row; file name lai-lo-<from>-<to>.xlsx
├── pnl.controller.ts                       # GET /api/reports/pnl, GET /api/reports/pnl/export (class-level Owner guard, export throttle)
└── analytics.module.ts                     # register(contracts, customers, economics)
app/apps/api/src/modules/finance/xlsx-writer.ts   # + Sheet, encodeSheets(sheets, at): N worksheets; encodeWorkbook delegates to it
app/apps/api/src/app.module.ts              # + AnalyticsModule.register(contracts, customers, economics)
```

## Frontend — reporting feature

```text
app/apps/admin/src/features/reporting/
├── api/report-api.ts                       # + PnlQueryState, fetchAnalytics, analyticsExportUrl, fetchPnl, pnlExportUrl
├── hooks/use-analytics.ts                  # useQuery ['analytics', from, to], enabled only without a range issue
├── hooks/use-analytics-page.ts             # range state, analyticsRangeIssue (366 days), export url
├── hooks/use-pnl.ts                        # useQuery ['pnl', to, months]
├── hooks/use-pnl-page.ts                   # to / months state, pnlIssue, export url
├── lib/analytics-presentation.ts           # defaultAnalyticsRange, analyticsRangeIssue, dimensionCells, monthLabel, monthCells, surchargeCells,
│                                           # utilisationCells, utilisationTableRows, analyticsTotalCards, monthSeries
├── lib/pnl-presentation.ts                 # defaultPnlQuery, pnlIssue, pnlMonthOptions, pnlRowCells, pnlTotalCells, pnlTotalCards, pnlSeries
├── lib/chart-geometry.ts                   # chartGeometry({ labels, series }): lines (SVG paths + points), ticks, zeroY, xLabels — pure
├── lib/analytics-translations.ts           # vi / en copy for both pages, tabs 'analytics' and 'pnl'
├── components/layout/ReportTabs.tsx        # + analytics, pnl tabs
├── components/filters/ReportRangeForm.tsx  # + optional maxDays prop
├── components/filters/RangeIssueAlert.tsx  # role="alert" message for the range issue (drift: extracted)
├── components/charts/TrendChart.tsx        # <figure><svg role="img" aria-label> composed from the parts below
├── components/charts/ChartGrid.tsx         # ticks + zero line (drift: extracted)
├── components/charts/ChartTick.tsx         # one dashed tick with label (drift: extracted)
├── components/charts/ChartLines.tsx        # one path + points per series (drift: extracted)
├── components/charts/ChartAxisLabels.tsx   # thinned x labels (drift: extracted)
├── components/charts/ChartLegend.tsx       # <figcaption> legend (drift: extracted)
├── components/analytics/AnalyticsHeader.tsx    # shared by both pages via titleKey / subtitleKey
├── components/analytics/AnalyticsTotals.tsx
├── components/analytics/AnalyticsBody.tsx  # loading / error / empty / sections
├── components/analytics/DimensionTable.tsx # header + DimensionRowItem rows
├── components/analytics/DimensionRowItem.tsx   # (drift: extracted)
├── components/analytics/ShareCell.tsx      # progress bar + percent (drift: extracted)
├── components/analytics/MonthSection.tsx   # chart + MonthTable
├── components/analytics/MonthTable.tsx     # (drift: extracted)
├── components/analytics/SurchargeTable.tsx # header + SurchargeRows
├── components/analytics/SurchargeRows.tsx  # kind rows + net row (drift: extracted)
├── components/analytics/UtilisationTable.tsx   # utilisationTableRows → UtilisationRowItem
├── components/analytics/UtilisationRowItem.tsx # (drift: extracted)
├── components/pnl/PnlForm.tsx              # month input + months select
├── components/pnl/PnlTotals.tsx
├── components/pnl/PnlBody.tsx              # totals + PnlTrendSection + PnlTable + PnlCardList
├── components/pnl/PnlTrendSection.tsx      # three-series TrendChart (drift: extracted)
├── components/pnl/PnlTable.tsx             # header + PnlTableRows, hidden below sm
├── components/pnl/PnlTableRows.tsx         # month rows + total row (drift: extracted)
├── components/pnl/PnlCardList.tsx          # phone cards
├── components/pnl/PnlCard.tsx              # (drift: extracted)
├── pages/AnalyticsPage.tsx
├── pages/PnlPage.tsx
└── index.ts                                # + AnalyticsPage, PnlPage
app/apps/admin/src/features/reporting/lib/economics-translations.ts   # tab labels shared with the new tabs
app/apps/admin/src/features/reporting/lib/report-presentation.ts      # MAX_REPORT_DAYS reused by the range form
app/apps/admin/src/shared/ui/KpiCard.tsx     # min-w-0 / break-words so eight-digit values fit a 360 px two-column grid (CR-13-02)
app/apps/admin/src/App.tsx                  # OWNER_PAGES + reports/analytics, reports/pnl
app/apps/admin/src/shared/i18n/i18n.ts      # + analyticsTranslations
```

## Tests

```text
app/tests/domain/analytics.test.ts          # contract helpers, revenue events, dimension / month / surcharge rows, reconciliation, window limits
app/tests/domain/utilisation.test.ts        # outline rows, actual return, swap, type and fleet sums
app/tests/domain/pnl.test.ts                # months ending, monthly depreciation, P&L rows, query validation outline
app/tests/api/analytics-report.test.ts      # golden report, 400 span, 403 Staff, empty range, six-sheet export
app/tests/api/pnl-report.test.ts            # golden twelve months, defaults, validation, export, 403
app/tests/admin/analytics-presentation.test.ts   # range issue, default range, cells, utilisation rows, chart geometry outline, pnl presentation
app/e2e/advanced-reporting.spec.ts          # Owner analytics journey (XE-003, August), range refusal, P&L journey, Staff denied
app/e2e/support/contracts.ts                # + exported csrfToken, returnContract (drift: added)
app/e2e/support/expenses.ts                 # seedExpense (drift: added)
app/e2e/release-accessibility.spec.ts       # + /reports/analytics, /reports/pnl
app/e2e/workspace-navigation.spec.ts        # + both routes in the Staff-denied list
```

## Documentation

```text
.project/scenarios/sprint-13/advanced-reporting.feature
.project/wireframes/screens/14-advanced-reporting.md (+ README row)
.project/sprints/sprint-13.md
.project/reviews/sprint-13-code-review.md
.project/state/specialists/google-code-reviewer-sprint-13.md
.project/state/specialists/google-qa-engineer-sprint-13.md
.project/documentation/architecture.md (§6.9, §12), security.md, operator-guide.md, release-checklist.md
.project/project-context.md (Session 21), state/pm-tracker.md, progress-dashboard.md
```

## Drift from the draft (CR-13-04)

- Not built: `charts/TrendTable.tsx` (the month and P&L tables already are the table fallback
  of each chart) and `pnl/PnlHeader.tsx` (`AnalyticsHeader` is shared through `titleKey` /
  `subtitleKey`).
- Added by the function-length gate (CR-13-01): the five chart parts, `RangeIssueAlert`,
  `ShareCell`, `DimensionRowItem`, `MonthTable`, `SurchargeRows`, `UtilisationRowItem`,
  `PnlTrendSection`, `PnlTableRows`, `PnlCard`; the pure helpers `utilisationTableRows` and
  `pnlMonthOptions`; `breakdowns()` in the analytics service.
- Added by the browser journeys (CR-13-03): `e2e/support/expenses.ts` and `returnContract`
  in `e2e/support/contracts.ts`, so a seeded active contract is returned inside the same spec.
- Touched outside the draft: `shared/ui/KpiCard.tsx` (CR-13-02), `economics-translations.ts`
  and `report-presentation.ts` (shared tab labels and the day limit).
