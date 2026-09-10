# Specialist Task State — google-qa-engineer Sprint 5

**Status:** COMPLETE
**Date:** 2026-09-10
**Skills Used:** google-qa-engineer, qa-testing, bdd, playwright, vitest

## Scenario coverage

`.project/scenarios/sprint-5/return-settlement.feature` — 18 scenarios (four outlines).

| Scenario | Evidence |
|---|---|
| Returning one vehicle keeps the contract renting | `tests/api/contract-returns.test.ts`: first return → still ACTIVE, `LINE_RETURNED` event, vehicle released |
| Returning the last vehicle completes the contract | API test: second return → COMPLETED, `completedAt` equals the last `actualReturnAt`, `CONTRACT_COMPLETED` audit; e2e "Đã trả" |
| A vehicle can only be returned once and only while renting | API test: CONFIRMED contract → 409, returned line again → 404 `NOT_FOUND` |
| Late-return charge is computed from the line snapshot at return time | API `it.each` (0 / 20.000 / 40.000 / 460.000 VND); `tests/domain` late-fee cases; e2e preview "40.000" |
| Late return records an immutable LATE_RETURN charge | API test: charge stored with the line, statement `chargesVnd` includes it; settlement freeze test |
| Early return does not refund unused rental days | API test: return at 07:00 → fee 0 and rental subtotal unchanged |
| Vehicle condition at return drives the fleet status | API `it.each` MAINTENANCE/DAMAGED → vehicle status and history reason "Hợp đồng <code>" |
| Inspection can record a damage charge in the same transaction | API test (DAMAGE with line); `prisma-sprint5.repositories.test.ts` createMany in one transaction; e2e "Trầy yếm trước" |
| Manual charges require a reason and discounts are Owner-only | `tests/api/contract-settlement.test.ts`: amount 0 / short description → 400, staff DISCOUNT → 403, owner → 201 |
| Settlement figures are explicit and never ambiguous in sign | `tests/domain/contract-settlement.test.ts` golden examples (receivable 240k, refund 160k, clamp); API partial-deposit case |
| The settlement statement lists rental, delivery, late, damage and discount lines | Domain `statementItems` order; API statement items `[RENTAL, DAMAGE, DISCOUNT]` |
| Settlement is refused while a vehicle is still out or after it was done | API: settle with open line → 409 naming XE-002; settle twice → 409 "đã tất toán" |
| Settlement confirms deposit and document release and freezes the figures | API: `{}` → 400 "giấy tờ", missing refund confirmation → 400 "hoàn cọc", success → `SETTLED` event + audit, later charge → 409 |
| Deposit applied cannot exceed the deposit or the outstanding amount | API: 200.000 over a 150.000 cap → 400 containing "150.000"; domain clamp; admin `depositCap` unit test |
| The return queue lists vehicles still out ordered by urgency | `tests/domain/return-queue.test.ts` ordering/counters; API queue shape and counters; admin `groupQueue`/`queueHighlights` |
| Extension and swap ignore returned lines | API: extension reprices only the open line (450.000 total), returned line keeps 150.000 |
| Staff receives vehicles from the return queue | `e2e/return-settlement.spec.ts`: "Đã nhận 0/2 xe" → two returns with a damage charge → item leaves the queue |
| Staff settles a contract from the detail page | `e2e/contract-lifecycle.spec.ts` (late return → "Cần hoàn cọc 160.000" → "Đã tất toán"); `e2e/return-settlement.spec.ts` (receivable 700.000) |

## Regression and side effects

- The manual "Đánh dấu đã trả" action is gone; the lifecycle journey now returns the vehicle
  through the "Nhận xe" dialog and settles the refund, so the whole Sprint 4 flow still passes.
- `/returns` is a live module; the navigation journey asserts the "Trả xe" heading instead of
  the preview banner.
- Demo contracts are not seeded when `nodeEnv` is `test`; API suites only assert against the
  contracts they create. The dev/e2e server still seeds `HD-2026-DEMO0001/0002`.
- Every API test boots the NestJS app; Vitest hook/test timeouts were raised to 30 s to stop
  false failures under parallel workers.

## Final verification

- Format, lint, strict typecheck (api + admin): pass.
- Unit/integration suite: 151/151 pass (domain 5 files, API 5, infrastructure 4, admin 7,
  contracts/security/others).
- Coverage: 95.69% statements, 85.12% branches, 95.06% functions and 96.81% lines (threshold 80%).
- Browser acceptance and regression: 37/37 pass in Chromium with timezone Asia/Ho_Chi_Minh
  for lifecycle and return journeys.
- Production build: pass (admin bundle 694 kB, warning only).
- Prisma schema validation: pass.
- Dependency audit: 5 high advisories, all from the transitive `multer` dependency of
  `@nestjs/platform-express`; unchanged from Sprint 4 and still an open follow-up.
- Private client workbooks stayed outside Git and outside every fixture; demo seeds, fixtures
  and screenshots are synthetic.

**Final QA verdict:** PASS (dependency audit follow-up open)
