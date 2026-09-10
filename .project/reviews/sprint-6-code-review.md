# Sprint 6 Payments, Receivables and Reporting — Code Review

**Reviewer:** google-code-reviewer  
**Date:** 2026-09-10  
**Initial verdict:** NEEDS MINOR  
**Re-review verdict:** LGTM

## Measurement Pass

- **M1 — file length:** 123 changed or new files under `app/` (TypeScript/TSX/SQL/Prisma).
  No TypeScript file exceeds the 300-line gate (the gate skips blank and comment lines).
  Largest production files: `prisma-contract.repository.ts` 316 physical lines (under the gate
  once comments are excluded), `i18n.ts` 271, `xlsx-writer.ts` 254, `prisma-contract.mapper.ts`
  234. `schema.prisma` grew to 390 lines; it is a declarative schema outside the lint gate.
- **M2 — function length:** the `max-lines-per-function` gate (30 lines) passes for every
  production file. Three admin components and three API functions were split during the review
  to get there (CR-6-01, CR-6-02).
- **M3 — duplicate scan:** balance math has one home in `@rental/contracts/payment-balance.ts`
  (`netPaid`, `remainingReceivable`, `paymentCap`, `paymentBalance`) and is imported by the API
  policy, the settlement statement and the admin dialog caps; the receivable due-date rule lives
  only in `receivable.policy.ts`; the report range rule is `reportWindow` on the API and
  `rangeIssue` in the admin mirrors the same constant `MAX_REPORT_DAYS`; the payment dialog is
  one component reused by the detail page (`PaymentDialog`) and the receivable list
  (`ContractPaymentDialog`).
- **M4 — drift:** the Sprint 1 `ReportPreview` and its "Có trong Sprint 6" copy were removed
  with the `04-module-previews.md` entry; `settlementPaidNote` ("chờ sổ thanh toán") was deleted
  now that the ledger exists. The blueprint was reconciled to the real file names (nested
  `components/*` folders, `report-api.ts`, `use-report-page.ts`, `PaymentKindField`,
  `ContractDetailContent`, `EmployeeDirectory` under `auth/`).
- **M5 — installed gates:** `max-lines`, `max-lines-per-function`, `complexity`,
  `no-magic-numbers`, `naming-convention`, `react/no-multi-comp`, the relative-import ban and
  the frontend architecture Vitest gate all run and pass.

## Findings

### CR-6-01 — Admin components exceeded the function-length gate (blocking)

**Severity:** 🟠 Major  
`PaymentAmountFields` (34 lines), `ContractDetailPage` (33) and `ReceivableTableRow` (32)
exceeded the 30-line gate; the report and finance features otherwise passed on the first run.
**Resolution:** extracted `PaymentKindField` and `ContractDetailContent`; the receivable row
renders paid and total due in one cell. Lint passes with zero warnings.

### CR-6-02 — API mapper, report policy and ZIP writer failed the length and magic-number gates (blocking)

**Severity:** 🟡 Medium  
`mapRecord` and `contractRow` reached 31 lines and `workbookParts` 36 lines; the ZIP header
writer used 25 literal byte offsets (`writeUInt16LE(value, 26)` and so on) that `no-magic-numbers`
rejects and reviewers cannot verify by eye.
**Resolution:** `mapQuote`, `groupNotes` and `groupEmployees` were extracted; the OOXML part
XML moved into named constants and a sequential `ByteWriter` writes each ZIP header top to
bottom (`u32(signature).u16(version)…`) with the field names as comments, so the 30/46/22-byte
layouts are readable without offset arithmetic.

### CR-6-03 — Browser scenarios raced each other and misread bookings as debts (blocking)

**Severity:** 🟡 Medium  
Three e2e defects surfaced in the first full run: (1) the Staff scenario seeded a CONFIRMED
contract and expected it in the receivable list, but the policy deliberately excludes bookings
("money is owed once the rental ended"); (2) the Sprint 3 conflict test shared today's window on
XE-001 with the parallel creation test and hit a real 409 at the quote step; (3) the Staff
scenario ran seven navigations in one test and exceeded the 30-second budget under four workers
while Vite compiled the new routes.
**Resolution:** the seed helper activates the past-dated rental; the conflict test fills its own
November window through the date fields; the Staff journey is two scenarios (detail-page
collection; receivable list plus the Owner-only API check) that mirror the feature file. Full
suite 40/40.

### CR-6-04 — Golden API ledger assumed the base day rate (blocking)

**Severity:** 🟢 Minor  
The receivable/report golden example priced a four-day rental at 150 000 ₫/day, but four days
fall in the 3–6 day tier (130 000 ₫/day), so `totalDueVnd` was 520 000 ₫ and the remaining
receivable assertions failed.
**Resolution:** the fixture names the tier math in a comment and the assertions use 520 000 /
350 000 / 170 000 ₫; the domain golden examples are unaffected because they build contracts
directly.

### CR-6-05 — Unique-violation detection is duck-typed (non-blocking, documented)

**Severity:** 🟢 Minor  
`isUniqueViolation` checks `error.code === 'P2002'` instead of `instanceof
PrismaClientKnownRequestError`. This is deliberate: the monorepo can load two Prisma client
copies (`@prisma/client` is not hoisted), which breaks `instanceof`. The comment states the
reason and `prisma-sprint6.repositories.test.ts` covers the race (stored row returned), the
orphan case (rethrown) and unrelated errors (rethrown).

### CR-6-06 — Scenario text said the "Thu tiền" action disappears after full payment (non-blocking, reconciled)

**Severity:** 🟢 Minor  
The UI scenario stated the button disappears once the receivable is cleared. The implementation
keeps the action on every non-cancelled contract until settlement so a refund can be recorded
through the same dialog (the collection cap then reads 0 ₫); after settlement the action shows
only while money is still owed. The feature file was reconciled to the implemented behaviour and
the e2e evidence.

### CR-6-07 — Admin bundle grew to 724 kB (non-blocking)

**Severity:** 🟢 Minor  
Sprint 6 added the ledger panel, receivable list and report screens to the single main chunk
(694 kB after Sprint 5). Route-level code splitting remains the carried-forward follow-up from
CR-4-06 and CR-5-06.

### CR-6-08 — Export link relies on the session cookie (accepted)

**Severity:** 🟢 Minor  
"Xuất Excel" is a plain `<a download>` to `/api/reports/revenue/export`, so the browser sends
the session cookie and the Owner guard runs server-side; the link is rendered only for a valid
range and the API re-validates it. No token is placed in the URL. Accepted as designed.

## Passed Areas

- **Money math:** `paymentBalance` nets refunds against receipts and clamps at zero, collection
  is capped by the remaining receivable and refunds by the net collected (BR-04); the statement
  `paidVnd` reads the ledger, and a settled contract keeps its frozen receivable while the
  ledger reduces the remaining amount (BR-07). Golden examples run in domain, API and admin
  tests.
- **Transactions and idempotency:** each payment is one Serializable transaction (ledger row +
  contract event) followed by an audit entry; the idempotency key is the row id with a unique
  index, a replay with the same contract, amount and kind returns the stored contract, a reused
  key answers 409, and a lost unique-index race returns the stored row.
- **Immutability:** no update or delete route exists for ledger rows; the migration adds an
  `amountVnd > 0` check and cascades only with the contract.
- **Authorization:** `AuthenticationGuard` + `OwnerAuthorizationGuard` sit on the whole report
  controller so Staff receives 403 before any query runs (BR-08); the receivable list carries no
  aggregates beyond remaining totals and is open to Staff; the SPA wraps `/reports` in
  `OwnerRoute` and Staff navigation omits it.
- **Business time:** daily rows, receivable ages and aging buckets use `businessDayKey`
  (Asia/Ho_Chi_Minh) on UTC timestamps; the report window is `[from 00:00, to 24:00)` in +07:00
  and refuses reversed, malformed or ≥ 92-day ranges.
- **Export:** the workbook is a valid ZIP (deflate entries, CRC-32, central directory) with one
  sheet, inline strings, numeric money cells, the 14 approved column headers, a totals row and a
  deterministic file name; the test-side reader inflates and parses it.
- **Frontend:** hooks own state and queries, one component per file, shadcn/Radix primitives
  only, the dialog autofocuses the amount, confirm is disabled while the amount exceeds the cap
  or the reference is missing for a transfer, every mutation invalidates ledger, receivable,
  report, queue and board queries, and the export link is disabled while the range is invalid.
- **Privacy:** fixtures, seeds and e2e data are synthetic (`Khách hàng mẫu`, `CCCD e2e`);
  employee names come from the account directory, never raw ids; payment references and notes
  are stored as given and appear only in the ledger, audit metadata and the Owner report.

## Gate evidence

- Format (`prettier --check . --end-of-line auto`): pass
- Lint (`--max-warnings=0`): pass
- Typecheck (api, admin): pass
- Unit/integration: 192/192 pass (31 files)
- Coverage: statements 96.36%, branches 86.18%, functions 95.9%, lines 97.28%
- Browser acceptance: 40/40 pass
- Production build: pass (admin bundle 724 kB, warning only)
- Prisma schema validation: pass
- Dependency audit: 4 high advisories via transitive `multer` (down from 5 in Sprint 5; no
  upload middleware in use; requires a major NestJS upgrade)

## Required Re-review

CR-6-01 to CR-6-04 were fixed and re-verified. CR-6-05, CR-6-06 and CR-6-08 are accepted as
documented; CR-6-07 joins CR-4-06/CR-5-06 and the dependency audit as follow-ups.
**Re-review verdict: LGTM.**
