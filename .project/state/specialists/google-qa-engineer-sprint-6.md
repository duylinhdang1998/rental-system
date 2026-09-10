# Specialist Task State — google-qa-engineer Sprint 6

**Status:** COMPLETE
**Date:** 2026-09-10
**Skills Used:** google-qa-engineer, qa-testing, bdd, playwright, vitest

## Scenario coverage

`.project/scenarios/sprint-6/finance-reporting.feature` — 14 scenarios (one outline with four examples).

| Scenario | Evidence |
|---|---|
| Staff collects a contract in two methods and the ledger nets the balance | `tests/api/contract-payments.test.ts`: cash 100.000 + transfer 200.000 → paid 300.000, cashier name, `PAYMENT_RECORDED` events and audit; e2e detail-page scenario |
| Payment balance is explicit in direction and never signed (outline ×4) | `tests/domain/contract-payment.test.ts` golden examples through `paymentBalance`; `tests/admin/payment-presentation.test.ts` "shows the money direction on every figure" |
| A payment cannot exceed the remaining receivable | API: over-cap collection → 400 "Thu tối đa"; domain and admin cap tests |
| Replaying a payment with the same idempotency key does not double-collect | API: same key → same ledger length, different amount → 409; `prisma-sprint6.repositories.test.ts` unique-index race returns the stored row |
| A refund reverses money already collected and never exceeds it | API: refund over net collected → 400 "Hoàn tối đa"; domain `paymentCap(REFUND)`; admin balance rows add the refund line only when money went back |
| Ledger entries are immutable and payments stay possible after settlement | API "keeps collecting after settlement until the frozen receivable is cleared"; domain "shrinks the frozen settlement receivable"; migration has no update path; admin action stays open while owed |
| The receivable list shows every contract that still owes money | API "lists overdue money for Staff and Owner, oldest first"; domain "lists only contracts whose rental ended with money still owed"; e2e list scenario |
| Revenue aggregates are Owner-only at the API and the UI | API: Staff → 403 on report and export; `tests/admin/navigation.test.tsx` omits `/reports` for Staff; e2e Staff GET → 403 |
| Daily rows group payments by Asia/Ho_Chi_Minh business day | `tests/domain/revenue-report.test.ts` (23:30 UTC lands on the next business day); API "totals the period by business day, employee and contract" |
| Revenue report totals reconcile to the ledger for the period | API golden totals (net, cash, transfer, refunds, contract count); domain `revenueTotals` |
| Excel export follows the approved 14-column layout | Domain: header order, totals row, deterministic `doanh-thu-<from>-<to>.xlsx`, ZIP inflates; API "exports the 14-column workbook"; admin "renders the 14 approved columns" |
| Report ranges are validated | Domain range rule; API reversed / 92-day / malformed → 400 and empty period → zero totals; admin `rangeIssue`; e2e alert + disabled export |
| Staff collects money from the contract detail page | `e2e/finance-reporting.spec.ts`: "Chưa ghi nhận khoản thu nào" → 100.000 with note → "+100.000", "Còn phải thu 50.000", timeline "Thu tiền"; list scenario clears the remaining 50.000 |
| Owner reviews today's revenue and exports Excel | e2e: totals, contract row 120.000 / XE-001, employee "Chủ cửa hàng", aging block, `.xlsx` download headers, invalid range disables the export |

## Regression and side effects

- The contract detail page now shows the ledger panel for every non-cancelled contract and a
  "Thu tiền" action from CONFIRMED onward; the Sprint 4–5 lifecycle, return and settlement
  journeys still pass with the extra action present.
- The receivable list replaced the "chờ sổ thanh toán" note: settlement statements read
  `paidVnd` from the ledger, so the Sprint 5 settlement API tests were re-run against the new
  source and pass unchanged.
- `/receivables` is live for both roles and `/reports` for the Owner; the navigation journey
  asserts the "Công nợ" and "Báo cáo doanh thu" headings instead of preview banners.
- Bookings never enter the receivable list; e2e seeds activate past-dated rentals. The Sprint 3
  conflict test now fills its own rental window so the parallel creation test cannot collide
  on XE-001.
- The Prisma fixture for Sprint 3–5 adapter tests carries the empty `payments` relation.

## Final verification

- Format, lint, strict typecheck (api + admin): pass.
- Unit/integration suite: 192/192 pass (31 files: domain 7, API 7, infrastructure 5, admin 9,
  contracts/security/others).
- Coverage: 96.36% statements, 86.18% branches, 95.9% functions and 97.28% lines (threshold 80%).
- Browser acceptance and regression: 40/40 pass in Chromium with timezone Asia/Ho_Chi_Minh
  for lifecycle, return and finance journeys.
- Production build: pass (admin bundle 724 kB, warning only).
- Prisma schema validation: pass.
- Dependency audit: 4 high advisories, all from the transitive `multer` dependency of
  `@nestjs/platform-express`; no upload middleware is in use; still an open follow-up.
- Private client workbooks stayed outside Git and outside every fixture; the export layout was
  reproduced from the approved column list, and demo seeds, fixtures and screenshots are
  synthetic.

**Final QA verdict:** PASS (dependency audit follow-up open)
