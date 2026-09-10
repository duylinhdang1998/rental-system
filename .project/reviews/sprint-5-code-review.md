# Sprint 5 Return and Settlement — Code Review

**Reviewer:** google-code-reviewer  
**Date:** 2026-09-10  
**Initial verdict:** NEEDS MINOR  
**Re-review verdict:** LGTM

## Measurement Pass

- **M1 — file length:** 112 changed or new files under `app/` (TypeScript/TSX/SQL/Prisma).
  No TypeScript file exceeds the 300-line gate. Largest production files:
  `prisma-contract.repository.ts` 274, `i18n.ts` 260, `contract-return.service.ts` 252.
  `schema.prisma` grew to 357 lines; it is a declarative schema outside the lint gate and is
  split by model, so no action is required.
- **M2 — function length:** the `max-lines-per-function` gate (30 lines) passes for every
  production file and for the e2e support helpers. Nine admin components were split during the
  review to get there (CR-5-01).
- **M3 — duplicate scan:** the late-fee formula now has one home in
  `@rental/contracts/late-fee.ts` (the pricing policy re-exports it); `settlementFigures` and
  `maxDepositApplied` are imported by both the API statement and the admin preview; the return
  dialog is shared by the queue and the detail page through `ReturnTarget`; `NotesField` is
  shared by the return and settlement dialogs.
- **M4 — drift:** the Sprint 1 `ReturnQueuePreview` and the manual `/complete` route were
  removed with their copy, so no stale entry point remains. "Đã tất toán" is used only by the
  settled badge and "Đã nhận xe" only by returned lines, so status text never collides.
- **M5 — installed gates:** `max-lines`, `max-lines-per-function`, `complexity`,
  `naming-convention`, `react/no-multi-comp`, static-style `no-restricted-syntax`, the
  relative-import ban and the frontend architecture Vitest gate all run and pass.

## Findings

### CR-5-01 — Admin components exceeded the function-length and naming gates (blocking)

**Severity:** 🟠 Major  
Sixteen lint errors: return, charge and settlement dialogs plus the line item, queue card and
detail page exceeded 30 lines, and the event describer map used object-literal arrow values
that violate `naming-convention`.
**Resolution:** extracted `ContractLineSummary`, `ContractDetailBody`, `ReturnTimeFields`,
`ReturnInspectionFields`, `ReturnChargeAmountFields`, `ChargeAmountFields`, `NotesField`,
`SettlementDialogs` and `ReturnQueueItemHeading`; describers are named `EventDescriber`
constants. Lint passes with zero warnings.

### CR-5-02 — API integration suites timed out under parallel workers (blocking)

**Severity:** 🟠 Major  
Every API test boots a NestJS application in `beforeEach`. With seven API files running in
parallel the cold boot exceeded Vitest's 10-second hook default and the first test of each
file failed with "Hook timed out".
**Resolution:** `vitest.config.ts` sets `hookTimeout` and `testTimeout` to 30 s with a
comment explaining why; the suite is green in a single run.

### CR-5-03 — Queue and re-return tests assumed dev-only demo data (blocking)

**Severity:** 🟡 Medium  
The queue test expected the seeded demo contract `HD-2026-DEMO0001`, but the demo contract
seed is skipped when `nodeEnv` is `test`, so the counters were off by one. The "return twice"
assertion used a single-vehicle contract, which completes on the first return and therefore
answered 409 instead of the intended 404.
**Resolution:** the queue test asserts only against contracts it creates
(`renting 1 / overdue 1 / dueToday 0`, exact line shape, CONFIRMED contract absent) and the
re-return case uses a two-vehicle contract so the second call hits the "already returned" path.

### CR-5-04 — Currency assertions hard-coded a plain space before ₫ (blocking)

**Severity:** 🟢 Minor  
`Intl.NumberFormat('vi')` emits a non-breaking space before the currency sign, so string
literals such as `'+100.000 ₫'` failed.
**Resolution:** admin presentation tests build expectations through `formatCurrency`, the
same helper the UI uses.

### CR-5-05 — Test files exceeded the size and complexity gates (blocking)

**Severity:** 🟢 Minor  
`settlement-presentation.test.ts` reached 321 lines, `contractFixture` hit complexity 15 and
33 lines, and the Prisma adapter test left two unused destructured names.
**Resolution:** queue presentation tests moved to `queue-presentation.test.ts`; the fixture
builds handover and quote through two helpers; the settlement draft is a named constant.

### CR-5-06 — Admin bundle grew to 694 kB (non-blocking)

**Severity:** 🟢 Minor  
Sprint 5 added the return queue and settlement screens to the single main chunk (663 kB after
Sprint 4). Route-level code splitting remains the carried-forward follow-up from CR-4-06.

### CR-5-07 — Return photo upload has no browser flow (non-blocking)

**Severity:** 🟢 Minor  
The API accepts only `private/returns/` object keys and exposes counts; the admin dialog does
not upload files yet. This matches the Phase 2 scope note in the sprint plan and should be
promoted through a change request before Sprint 6.

## Passed Areas

- **Money math:** `settlementFigures` clamps deposit applied to `min(deposit, outstanding)`,
  returns receivable and refund as separate non-negative integers and never emits a signed
  balance (BR-04); golden examples are covered in the domain tests.
- **Transactions:** return, charge and settlement writes run in Serializable Prisma
  transactions; the late fee, inspection charge, line update, contract completion and event
  are written together or not at all.
- **State rules:** a line returns once, only while ACTIVE/OVERDUE, never before the line start
  and never in the future; completion is derived from the last open line (BR-03); charges and
  settlement are refused once `settledAt` is set (BR-07); DISCOUNT requires OWNER (BR-06).
- **Fleet synchronization:** MAINTENANCE/DAMAGED conditions write a vehicle status history
  entry that names the contract before schedule sync; GOOD derives the status from remaining
  holds.
- **Security:** all POST routes require session plus CSRF; unauthenticated queue access is
  401; private image keys are validated by prefix and never echoed in responses, seeds or logs;
  no PII in fixtures.
- **Frontend:** one component per file, hooks own state/queries, shadcn/Radix primitives
  only, dialogs autofocus and return focus, disabled confirm until the release checklist is
  complete, previews use the shared formula so the browser never disagrees with the API.
- **Timezone:** queue classification, late-minute counts and formatting use Asia/Ho_Chi_Minh
  over UTC persistence; e2e runs with that timezone pinned.

## Gate evidence

- Format (`prettier --check --end-of-line auto`): pass
- Lint (`--max-warnings=0`): pass
- Typecheck (api, admin): pass
- Unit/integration: 151/151 pass
- Coverage: statements 95.69%, branches 85.12%, functions 95.06%, lines 96.81%
- Browser acceptance: 37/37 pass
- Production build: pass (admin bundle 694 kB, warning only)
- Prisma schema validation: pass
- Dependency audit: 5 high advisories via transitive `multer` (unchanged from Sprint 4; no
  upload middleware in use; requires a major NestJS upgrade)

## Required Re-review

CR-5-01 to CR-5-05 were fixed and re-verified. CR-5-06 and CR-5-07 are accepted as documented
follow-ups together with CR-4-04, CR-4-05 and the dependency audit. **Re-review verdict: LGTM.**
