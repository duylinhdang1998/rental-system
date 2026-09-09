# Specialist Task State — google-qa-engineer Sprint 4

**Status:** COMPLETE
**Date:** 2026-09-09
**Skills Used:** google-qa-engineer, qa-testing, bdd, playwright, vitest

## Scenario coverage

`.project/scenarios/sprint-4/contract-lifecycle.feature` — 17 scenarios (one outline).

| Scenario | Evidence |
|---|---|
| Only approved lifecycle transitions are allowed | `tests/domain/contract-lifecycle.test.ts` transition matrix; API 409 `INVALID_TRANSITION` |
| Handover moves a reservation into renting and rents the vehicles | `tests/api/contract-lifecycle.test.ts`; e2e handover → "Đang thuê" |
| Forbidden transitions return 409 without side effects | API test: status, vehicle and events unchanged |
| Scheduled evaluation marks overdue contracts exactly once | API test: `evaluateOverdue` twice → one OVERDUE event, `overdueSince` stable |
| Grace period affects fees, not the overdue state | Domain test: `isPastScheduledEnd` boundary and `calculateLateReturnFee` grace |
| Cancellation keeps the record and records actor plus reason | API test (400 short reason, audit metadata); e2e cancel → "Đã hủy" + timeline reason |
| Extension is rejected when the extra range conflicts | API 409 naming vehicle and contract; e2e alert "trùng thời gian" |
| Extension reprices the whole period by the final tier and stores before/after history | API 650.000 → 700.000 from snapshot v1; e2e 300.000 → 390.000 |
| Extension must move the return date later | API 400 `INVALID_INPUT` |
| Swap is rejected when the replacement is not available | API 409 (rented, booked) and 400 (same vehicle) |
| Swap ends the old line and links the replacement | API line links, unchanged total, PDF; e2e replaced/active lines and "XE-002 → XE-003" |
| Completing a contract releases its vehicles | API test: XE AVAILABLE, availability true; e2e "Đã trả" |
| Contract list filters by status and search | API `?status`, `?search`; e2e `/contracts?status=CONFIRMED` |
| Operations board separates due today from overdue using business time | Domain `buildBoard`; API board at 2026-10-06T08:00Z |
| Dashboard shows overdue first with explicit hours late | Domain sort; presentation unit test; e2e priority link |
| Dashboard empty and error states keep the shell | e2e responsive-preview empty/error/loading with `/api/contracts/board` intercepts |
| Staff manages a contract from the detail page | e2e detail page actions, dialogs and timeline |

## Regression and side effects

- Contract creation now reserves the vehicle immediately; the fleet journey filters by search
  instead of AVAILABLE status so parallel workers cannot hide XE-001.
- The dashboard journeys intercept `/api/contracts/board` and assert business-date and fleet
  summary patterns instead of fixed demo numbers.
- Browser sign-in waits for the login response; the earlier race caused 12 false failures
  under parallel load and is fixed in `e2e/support/auth.ts`.

## Final verification

- Format, lint, strict typecheck (api + admin): pass.
- Unit/integration suite: 111/111 pass (domain 3 files, API 3, infrastructure 3, admin 5,
  contracts/security/others).
- Coverage: 95.06% statements, 81.42% branches, 94.7% functions, 96.36% lines (threshold 80%).
- Browser acceptance and regression: 36/36 pass in Chromium with timezone Asia/Ho_Chi_Minh
  for lifecycle journeys.
- Production build: pass (admin bundle 663 kB, warning only).
- Prisma schema validation: pass.
- Dependency audit: 5 high advisories, all from the transitive `multer` dependency of
  `@nestjs/platform-express`. No upload middleware is used by the API, and the fix requires a
  major NestJS upgrade, so it is logged as an open follow-up rather than a Sprint 4 blocker.
- Private client workbooks stayed outside Git and outside every fixture; demo seeds are synthetic.

**Final QA verdict:** PASS (dependency audit follow-up open)
