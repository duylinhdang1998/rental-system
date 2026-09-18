# 04 — Module Preview Screens

**Story:** US-004  
**Rule:** Read-only demo previews in Sprint 1; real mutations are scheduled later.

## Shared desktop layout

```text
Page title + description                                  [Future primary action]
[Search________________________________] [Status ▾] [More filters] [Reset]
┌──────────────────────────────────────────────────────────────────────────────┐
│ Semantic data table with status, core fields and row action                 │
└──────────────────────────────────────────────────────────────────────────────┘
Showing 1–20 of N                                      [Previous] 1 2 [Next]
```

## Shared mobile layout

```text
Page title
[Search____________________]
[Filters (2)] [Sort ▾]
┌──────────────────────────┐
│ identifier      [status] │
│ primary metadata         │
│ secondary metadata       │
│ [View]             [•••] │
└──────────────────────────┘
[Load more / pagination]
```

## Vehicle preview — Sprint 2

- KPI strip: available, rented, reserved, maintenance.
- Search by plate/model; filter status/type.
- Row/card: plate, model/color, current status, active contract/customer, next relevant time.
- Primary button “Thêm xe” is disabled with “Có trong Sprint 2”. View action opens a read-only preview drawer.

## Customer preview — Sprint 2

- Search by name/phone/document; filter tags/blacklist.
- Row/card: customer name, primary contact, VIP/returning/blacklist warning, rentals count, latest rental.
- PII is minimized in the list; document image/details are not included in demo payload.

## Contract preview — Sprint 3/4

- Tabs/filter: all, reserved, active, overdue, completed, cancelled.
- Row/card: contract code, customer, vehicle count, rental range, balance summary, lifecycle status.
- Direct overdue items lead with the overdue duration; staff only sees allowed demo assignments.

## Return preview — replaced in Sprint 5

- The Sprint 1 preview was replaced by the live return queue; see
  `09-return-settlement.md` for the queue, per-vehicle return and settlement screens.

## Report preview — replaced in Sprint 6

- The Sprint 1 preview was replaced by the live Owner-only revenue report with Excel export;
  see `10-finance-reporting.md` for the ledger panel, payment dialog, receivable list and report.

## Employees preview — superseded

- Replaced in Sprint 7 by the live employee management screen in `11-employees-audit.md` (create, lock, unlock, reset password).

## Settings preview — Owner only, later sprints

- Cards for business profile, vehicle types, documents, tags, pricing and late fees.
- Each card states its target sprint and has no fake save success.
