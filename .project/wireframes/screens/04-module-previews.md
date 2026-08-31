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

## Return preview — Sprint 4/5

- Two queues: “Trả hôm nay” and “Quá hạn”.
- Row/card: deadline, contract, each vehicle still out, customer, expected settlement context.
- “Nhận xe” stays disabled with “Có trong Sprint 5”.

## Report preview — Owner only, Sprint 6

- Period control and summary cards: gross received, receivable, contracts, utilization placeholder.
- One simple revenue chart with text/table fallback.
- “Xuất Excel” disabled with “Có trong Sprint 6”; Staff direct route returns denied.

## Employees preview — Owner only, later Sprint 1 business expansion

- Read-only list of demo Owner/Staff accounts, work status and last login.
- Lock/reset/create actions are visually represented but disabled in the UI preview except real session lock enforcement tested by API fixtures.

## Settings preview — Owner only, later sprints

- Cards for business profile, vehicle types, documents, tags, pricing and late fees.
- Each card states its target sprint and has no fake save success.
