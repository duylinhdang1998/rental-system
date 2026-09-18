# Specialist Task State — google-qa-engineer Sprint 12

**Status:** COMPLETE
**Date:** 2026-09-18
**Skills Used:** google-qa-engineer, qa-testing, bdd, playwright, axe-core, vitest

## Scenario coverage

`.project/scenarios/sprint-12/operations-finance.feature` — 14 scenarios (three outlines).

| Scenario | Evidence |
|---|---|
| The Owner maintains the damage catalog and Staff only reads it | `tests/api/damage-catalog.test.ts`: POST "guong" → 201 code `GUONG`, active, 150 000; `DAMAGE_ITEM_CREATED` with code and price; duplicate → 409 `DAMAGE_ITEM_EXISTS`; PATCH price 180 000 + inactive → 200 and `DAMAGE_ITEM_UPDATED` with before/after price; Staff list excludes inactive, Owner `includeInactive=true` includes it; Staff POST/PATCH → 403 |
| Damage item input is validated (outline) | `tests/domain/damage-catalog.test.ts`: the five rows of `damageItemInputSchema` (valid, short code, short name, negative price, price above 1 000 000 000) |
| A return charge priced from the catalog uses the catalog price and name | `tests/api/contract-returns.test.ts` / `tests/domain/damage-catalog.test.ts`: return with `damageItemId` → one DAMAGE charge 150 000 "Gương chiếu hậu" with `damageItemCode` metadata, statement lists XE-001; inactive item → 409 `DAMAGE_ITEM_INACTIVE`; unknown → 404 `DAMAGE_ITEM_NOT_FOUND`; free text 120 000 "Trầy yếm trước" accepted |
| Return photos are uploaded to private storage and served through short-lived links | `tests/api/return-photos.test.ts`: two 1 KB PNGs → 201 with two keys under `private/returns/<id>/`, file names absent; return with the keys → `imageCount` 2, keys never echoed; line links → two items with `expiresInSeconds` 300; GET link → 200 `image/png`, `Cache-Control: private, no-store`; tampered → 404; expired (clock advanced) → 404 |
| Uploads that are not small JPEG, PNG or WebP images are refused before storage (outline) | Same file: GIF renamed `.png` → 400 `UNSUPPORTED_FILE`; `notes.txt` → 400; 3 MB PNG → 413 `PAYLOAD_TOO_LARGE`; six files → 400 `TOO_MANY_FILES`; the memory store stays empty after each refusal |
| The deposit is refunded once, through the ledger, after settlement | `tests/api/deposit-refund.test.ts`: settled contract deposit 500 000 / due 300 000 → refund 200 000, `depositRefunded` false; POST CASH K1 → 201 row `DEPOSIT_REFUND` 200 000; flag true; balance `paidVnd` 0, `depositRefundedVnd` 200 000; `CONTRACT_DEPOSIT_REFUNDED` with amount and method; replay K1 → same row, one row; new key → 409 `DEPOSIT_ALREADY_REFUNDED`; refund 0 → 409 `NO_DEPOSIT_REFUND_DUE`; unsettled → 409 `CONTRACT_NOT_SETTLED` |
| Deposit refunds never touch revenue, receivables or the refund cap | `tests/domain/contract-payment.test.ts`: netPaid 300 000, remaining 0, REFUND cap 300 000 with a `DEPOSIT_REFUND` row present; `tests/domain/revenue-report.test.ts`: the day's cash figure stays 300 000 |
| A cash shift is opened once and closed with the counted amount | `tests/api/cash-shifts.test.ts`: Staff open float 1 000 000 → 201 OPEN, opener "Nhân viên", `CASH_SHIFT_OPENED`; Owner second open → 409 `CASH_SHIFT_ALREADY_OPEN`; movements (CASH payment 300 000, refund 50 000, deposit refund 200 000, expense 100 000, bank transfer 400 000, pre-shift expense 70 000) → expectation 300 000 / 50 000 / 200 000 / 100 000 / 950 000; close 930 000 without note → 400 `CASH_SHIFT_NOTE_REQUIRED`; with note → 200 CLOSED, variance −20 000, `CASH_SHIFT_CLOSED` with the three figures; close again → 409 `CASH_SHIFT_NOT_OPEN` |
| Expected cash is the opening float plus cash movements inside the window (outline) | `tests/domain/cash-shift.test.ts`: the three golden rows (950 000 / −20 000, 0 / 0, 200 000 / +50 000) through `expectedCash` and `cashVariance`; the window excludes rows before `openedAt` |
| Staff sees only their own shifts while the Owner reviews every shift | API: Staff list → own shift only; Owner list → both, newest first; float or note outside the bounds → 400 |
| The Owner prices a damage item and Staff uses it with photos while returning a vehicle | `e2e/operations-finance.spec.ts` journey 1: `/settings/damage-items` → "Thêm hạng mục" → row `E2E…` 150.000 "Đang dùng" → "Sửa" to 180.000; return queue "Nhận xe" → "Hạng mục hư hỏng" select fills 180000 and the name read-only → one PNG via the file field ("1 tệp đã chọn") → contract detail "Ảnh nhận xe: 1" with one thumbnail, settlement items list the item, "Hoàn lại" 20.000 → "Tất toán hợp đồng" without a deposit checkbox → badge "Chưa hoàn cọc" → "Hoàn cọc" dialog shows 20.000, bank transfer with reference → badge "Đã hoàn cọc", action gone, timeline "Hoàn cọc" |
| Staff opens and closes a cash shift and the Owner reviews it | Journey 2: `/cash-shifts` → "Mở ca" 1 000 000 → current card, "Mở ca" hidden, expected ≥ 1.000.000 → CASH payment 200 000 through the API → expected grows by ≥ 200.000 → "Đóng ca" with counted = expected − 20 000 → variance preview shows "−", "Xác nhận đóng ca" disabled until a note → history row with the note and "Thiếu". The Owner list is covered by the API role test; the browser journey stays Staff-only to avoid a second sign-in inside the 90 s budget |
| Navigation and access | `tests/admin/navigation.test.tsx` (Staff and Owner lists include `/cash-shifts`), `e2e/workspace-navigation.spec.ts` Staff-denied loop includes `/settings/damage-items` |
| `/cash-shifts` and `/settings/damage-items` pass the accessibility and overflow sweep | `e2e/release-accessibility.spec.ts`: login + 15 routes × 2 viewports (360/1280): axe WCAG 2.2 AA no serious/critical, one `h1`, no horizontal overflow — 32/32 |

Admin presentation rules: `tests/admin/cash-shift-presentation.test.ts` (16 tests: open / close
blocked rules, variance preview and tone, movement rows, signed formatting),
`tests/admin/damage-catalog-presentation.test.ts` (6: form → input, upper-cased code,
blocked rule, status tone, sorted rows, inactive filter), `tests/admin/return-form.test.ts`
(4: catalog item into both forms and back to free text, catalog id vs free text in the input,
photos bundled with the input, upload limits mirrored), plus the updated settlement and
payment presentation tests (deposit gate removed, `refundDeposit` action only while due,
`DEPOSIT_REFUNDED` described with a minus sign, `ledgerDepositRefunded` row).

## Regression and side effects

- Settlement dialog lost the deposit checkbox (PD-17): `e2e/contract-lifecycle.spec.ts` was
  updated to assert the checkbox is gone and the "Chưa hoàn cọc" badge and "Hoàn cọc" action
  appear after settling; `e2e/return-settlement.spec.ts` (free-text damage charge) passes
  unchanged.
- Payment dialog now offers PAYMENT / REFUND only (`ManualPaymentKind`); the Sprint 6 ledger
  journey and `tests/api/contract-payments.test.ts` pass; a `DEPOSIT_REFUND` posted through
  the manual route is refused by the schema.
- Audit page renders six new actions and two new entity types; the i18n parity test keeps both
  dictionaries aligned (the removed `settleDepositRefunded` key is gone from both).
- Prisma infrastructure tests cover the two new repositories and the deposit-refund
  transaction (`prisma-sprint12.repositories.test.ts`) without a database.
- First full browser run: 75/77. The lifecycle journey timed out on the removed checkbox and,
  once past it, still expected "Hợp đồng đã đóng" while the "Hoàn cọc" action was pending
  (fixed, CR-12-03: the journey now refunds by bank transfer first). The cash-shift journey
  hit a strict-mode violation on "Mở ca" rendered by both the header and the empty state
  (`.first()`) and then a 400 from the payment cap because its seeded contract carried the
  default 500 000 deposit (seeded with no deposit over two days). Both files pass on the
  rerun; no product change was needed.

## Final verification

- Format check, lint (zero warnings), strict typecheck (contracts + api + admin).
- 338 unit/integration tests in 55 files; coverage 96.58 % statements / 86.58 % branches /
  96.37 % functions / 97.25 % lines (gate 80 %).
- 77 browser tests pass (Chromium, 360 px and 1280 px) after the two spec fixes.
- Production build, Prisma schema validation, `npm audit` 0 vulnerabilities.
- No private client rows in any fixture, screenshot or log; the uploaded test image is a
  generated 1×1 PNG; demo data only.

**Verdict:** QA PASS for Sprint 12.
