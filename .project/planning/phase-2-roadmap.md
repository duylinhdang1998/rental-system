# Phase 2 Roadmap — Asset and Finance Optimisation

**Status:** ACTIVE — opened on 2026-09-18 after the MVP application scope (Sprint 0–7) closed  
**Source:** `implementation-plan.md` §3.2 (priority 2 items) and `requirements/scope.md` "Giai đoạn 2"  
**Stories:** Epic I — `requirements/user-stories/epic-i-asset-finance.md` (US-023 … US-030)  
**Numbering:** Sprint 8–10 were remediation / UI-foundation sprints, so Phase 2 continues at
Sprint 11.

The MVP is feature complete; only provider-side go-live gates remain
(`documentation/release-checklist.md` §B). Phase 2 adds the priority 2 items in three
two-week sprints. Each sprint follows the same batches as the MVP: BDD scenarios → wireframe
→ exact file blueprint → implementation with every gate → code review → QA → tracker update →
commit on its own `feature/sprint-N-*` branch.

## Sprint map

| Sprint | Name                                        | Priority 2 items covered                                                                 | Stories          |
| ------ | ------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------- |
| 11     | Asset economics — cost, depreciation, expenses, break-even | Giá vốn, khấu hao và điểm hòa vốn từng xe; quản lý chi                                    | US-023, US-024, US-025 |
| 12     | Operations finance — damage catalog, return photos, cash shift close, deposit refund | Ảnh xe lúc nhận về; danh mục và bảng giá hư hỏng; chốt ca tiền mặt; hoàn tiền cọc         | US-026, US-027, US-028 |
| 13     | Advanced reporting — multi-dimensional revenue, utilisation, P&L, surcharges, trends | Báo cáo doanh thu đa chiều, tỷ lệ sử dụng xe, lãi/lỗ, phụ phí và biểu đồ xu hướng          | US-029, US-030   |
| —      | Legacy Excel import                         | Nhập dữ liệu lịch sử từ Excel cũ                                                          | PD-08 (blocked: no source workbook has been supplied) |

Sprint 13 depends on the expense and depreciation data of Sprint 11 and on the damage catalog
and cash-shift data of Sprint 12, so the order is fixed.

## Sprint 11 — Asset economics

**Goal:** the Owner knows what every vehicle cost, what it has earned, what it has consumed and
when it pays for itself.

- Per-vehicle acquisition record (purchase price, purchase date, useful life in months,
  salvage value) set by the Owner; straight-line monthly depreciation and book value derived
  from it as of any business day.
- Append-only expense ledger for both roles: category, amount, cash / bank transfer, paid day,
  optional vehicle, description, reference and notes; idempotent on a client key; the Owner
  corrects a mistake with a reversal entry (never an edit or delete, BR-07 / BR-09).
- Fleet economics report (Owner only): per vehicle, revenue attributed from contract lines and
  line-level charges, expenses, net contribution, accumulated depreciation, book value,
  recovered share and a break-even projection from the trailing 90-day rate; fleet totals with
  unallocated revenue (delivery fees, contract-level charges and discounts) and unallocated
  expenses; Excel export.
- Screens: acquisition dialog on the vehicle list (Owner), `/expenses` list with filters and
  "Ghi chi phí" dialog, `/reports/fleet` economics page with report tabs.

## Sprint 12 — Operations finance

- Damage catalog with a price list (Owner CRUD, active flag); the return dialog picks catalog
  items and writes itemised DAMAGE charges; free-text damage stays possible.
- Return photos: the existing `imageObjectKeys` on a return gain an upload path and a gallery
  count on the contract detail, following the private-file policy.
- Cash shift close: a Staff member opens a shift, the system computes expected cash from CASH
  payments minus CASH refunds minus CASH expenses since the shift opened, the cashier enters
  the counted amount, the variance is frozen with a note and the Owner reviews closed shifts.
- Deposit refund: a one-click "Hoàn cọc" action that records the settlement refund figure as
  a REFUND ledger entry and marks `depositRefunded`, if the Sprint 5–6 flow still needs it.

## Sprint 13 — Advanced reporting

- Revenue by vehicle type, vehicle, customer nationality and month; surcharge report
  (late / damage / other / discount) by period; utilisation (rented days over fleet days) per
  vehicle and type; monthly P&L (revenue − expenses − depreciation).
- Twelve-month trend charts drawn as inline SVG with table fallbacks (no chart library) and
  Excel exports per report.

## Definition of done (every Phase 2 sprint)

- Approved Given/When/Then scenarios are implemented and green in unit, integration and
  browser tests; coverage stays above 80 % on every dimension.
- Format, lint (zero warnings), strict typecheck, production build, Prisma schema validation
  and dependency audit pass; the axe WCAG 2.2 AA sweep covers every new route.
- Code review LGTM and QA PASS documents exist under `.project/reviews/` and
  `.project/state/specialists/`.
- Vietnamese operator guide gains a section for every new screen.
