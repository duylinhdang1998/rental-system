# Sprint 12 Operations Finance — Code Review

**Reviewer:** google-code-reviewer  
**Date:** 2026-09-18  
**Initial verdict:** NEEDS MINOR  
**Re-review verdict:** LGTM

## Measurement Pass

- **M1 — file length:** 79 changed and 87 new files under `app/` (TypeScript/TSX/SQL). No
  TypeScript file exceeds the 300-line gate (blank lines and comments excluded). Closest:
  `prisma-contract.repository.ts` 289 after `prisma-contract.queries.ts` and
  `prisma-payment.writes.ts` were split out, `shared/i18n/i18n.ts` 281.
- **M2 — function length:** the 30-line gate passes for every production file. Three contract
  components were split during the review (CR-12-01); the delegated cash-shift and catalog
  pages were split by their authors before hand-over.
- **M3 — duplicate scan:** charge pricing has one home (`ChargePricingService`, used by the
  return and the manual-charge paths); expected cash and variance have one home
  (`expectedCash` / `cashVariance` in `@rental/contracts`, reused by `cash-shift.policy.ts`
  and the admin preview); image sniffing and link signing have one home each under
  `common/files/`; the admin "catalog item into a form" rule has one shape (`applyDamageItem`
  / `applyChargeItem`) and one select (`DamageItemSelect`) for both dialogs; upload limits are
  read from `RETURN_PHOTO_LIMITS` on both sides.
- **M4 — drift:** the draft blueprint named `modules/catalog/`, `DamageCatalogPage`,
  `damage-catalog-translations.ts` and a close-only form hook; the code uses
  `modules/damage-catalog/`, `DamageItemsPage`, `settings-translations.ts` and one
  `use-cash-shift-form.ts`, and gained the split components. The blueprint was reconciled to
  the files that exist (CR-12-04). No stale route, dictionary key or preview page; the removed
  `settleDepositRefunded` key is gone from both dictionaries.
- **M5 — installed gates:** `max-lines`, `max-lines-per-function`, `max-params`,
  `complexity`, `no-magic-numbers`, `naming-convention`, `react/no-multi-comp`, the
  relative-import ban, the frontend architecture Vitest gate and the i18n parity test all run
  and pass with zero warnings.

## Findings

### CR-12-01 — Contract components exceeded the function-length gate (blocking)

**Severity:** 🟠 Major  
`ChargeFields` (35 lines), `DepositRefundDialog` (43) and `SettlementStatus` (33) exceeded
30 lines after the catalog select, the refund fields and the refund badge were added.
**Resolution:** `ChargeLineField.tsx`, `DepositRefundFields.tsx` and `DepositRefundBadge.tsx`
were extracted; the dialogs only compose. Lint passes with zero warnings.

### CR-12-02 — Settlement presentation test broke the length gate and used blind casts (blocking)

**Severity:** 🟡 Medium  
`tests/admin/settlement-presentation.test.ts` grew past 300 lines and the new catalog / photo
cases used `as never` to satisfy the change callbacks.
**Resolution:** the catalog and photo cases moved to `tests/admin/return-form.test.ts` with
typed change recorders; no cast remains.

### CR-12-03 — Lifecycle browser journey still ticked the removed deposit checkbox (blocking)

**Severity:** 🟡 Medium  
`e2e/contract-lifecycle.spec.ts` checked "Đã hoàn cọc cho khách" inside "Tất toán hợp đồng";
PD-17 removed that checkbox, so the first full browser run timed out on it, and the new
cash-shift journey hit a strict-mode violation because the empty state and the header both
render "Mở ca".
**Resolution:** the lifecycle journey now asserts the checkbox is gone, settles, expects the
"Chưa hoàn cọc" badge, records the refund by bank transfer and only then expects "Hợp đồng đã
đóng" (the closed message renders once no action is left); the cash-shift journey clicks the
first "Mở ca" and seeds its contract without a deposit so the 200 000 cash collection stays
under the payment cap. 77/77 on the rerun.

### CR-12-04 — Blueprint drift (non-blocking, reconciled)

**Severity:** 🟢 Minor  
Module, page and dictionary names and the split components differed from the draft.
`file-blueprint-sprint-12.md` lists the files as built and records the drift.

### CR-12-05 — Disk file store is single-replica (accepted, documented)

**Severity:** 🟢 Minor  
`DiskFileStore` writes under `PRIVATE_FILE_DIR` on the API host, so a second replica would
not see the first replica's photos. Same class of gate as the in-memory throttle store; an
S3-compatible adapter behind the same `PrivateFileStore` port is listed in the release
checklist for scaling out. Recorded under PD-17 as the working default.

### CR-12-06 — Expected cash reads whole ledgers (accepted)

**Severity:** 🟢 Minor  
`CashExpectationService` lists every financial contract and every expense and filters in
memory by the shift window. Acceptable at shop scale (one branch, hundreds of rows a month)
and it keeps one implementation of the window rule; an indexed query is a follow-up if a shift
ever spans tens of thousands of rows.

## Passed Areas

- **Authorization:** catalog writes are `@Roles('OWNER')`; shift close is refused for anyone
  but the opener or the Owner; Staff shift lists are scoped to the actor at the service, not
  the client; every mutation keeps the CSRF requirement; the upload route has its own
  throttle policy.
- **Private files:** keys are `private/returns/<contractId>/<uuid>.<ext>`; original file
  names never reach the store or the response; the list route returns signed links only;
  tokens are HMAC-SHA256 over `objectKey|exp` with the session secret and verified with a
  constant-time compare; expired or tampered tokens 404; responses are `private, no-store`;
  the disk store rejects any key that resolves outside its root.
- **Immutability (BR-07):** `DEPOSIT_REFUND` is a ledger row, written once, replayable by key,
  never included in revenue, caps or receivables; the settlement flag is set in the same
  transaction as the row and the event.
- **Money:** integer VND throughout; the refund amount comes from the frozen settlement, not
  the request; variance is `counted − expected` with a true minus sign in the UI.
- **Time:** the shift window is `[openedAt, now)` on UTC timestamps; business-day keys are
  untouched; the admin previews variance from the same expectation the API returns.
- **Audit:** `DAMAGE_ITEM_CREATED` / `UPDATED` carry code and before / after price,
  `CASH_SHIFT_OPENED` / `CLOSED` carry float, expected, counted and variance,
  `CONTRACT_DEPOSIT_REFUNDED` carries amount and method; no notes or references reach the log.
- **Frontend architecture:** hooks only under `hooks/`, no state hooks in `.tsx`, one
  component per file, absolute imports, `LifecycleFormDialog` reused for the refund and both
  shift dialogs, one idempotency key per dialog instance, upload-then-return in one mutation
  so a refused upload keeps the dialog open.
- **Accessibility:** catalog action buttons carry the item code in `aria-label`; the settings
  strip is a `nav` with `aria-current="page"`; the photo input is a labelled file field with
  the limits in its label; the sweep is 32/32 across both viewports including the two new
  routes.

## Final verification

- Format check, lint (zero warnings), strict typecheck (contracts + api + admin).
- 338 unit/integration tests in 55 files; coverage 96.58 % statements / 86.58 % branches /
  96.37 % functions / 97.25 % lines.
- 77 browser tests (71 baseline + 2 operations-finance journeys + 4 sweep checks); see the QA
  note for the two failures on the first full run.
- Production build, Prisma schema validation, `npm audit` 0 vulnerabilities.
