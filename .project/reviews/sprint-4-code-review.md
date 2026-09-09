# Sprint 4 Contract Lifecycle — Code Review

**Reviewer:** google-code-reviewer  
**Date:** 2026-09-09  
**Initial verdict:** NEEDS MINOR  
**Re-review verdict:** LGTM

## Measurement Pass

- **M1 — file length:** 96 changed or new files under `app/` (89 TypeScript/TSX/CSS/SQL/Prisma).
  No file exceeds 300 lines. Largest production files: `prisma-contract.repository.ts` 257,
  `i18n.ts` 254, `demo-contract.repository.ts` 232.
- **M2 — function length:** the `max-lines-per-function` gate (30 lines) passes for every
  production file, including the e2e support helpers, which are not exempt.
- **M3 — duplicate scan:** shared declarations are single-source: `conflictMessage` is reused by
  extension and swap, `requireContract` by every lifecycle service, `activeLines` by services and
  the PDF renderer, and browser sign-in now lives only in `e2e/support/auth.ts` (three copies
  removed during the review).
- **M4 — drift:** the swap-reason label contradicted the required schema field (CR-4-01, fixed).
  No raw colors, static inline styles or arbitrary Tailwind utilities were added in feature TSX.
- **M5 — installed gates:** `max-lines`, `max-lines-per-function`, `complexity`,
  `react/no-multi-comp`, static-style `no-restricted-syntax`, relative-import ban and the frontend
  architecture Vitest gate all run and pass.

## Findings

### CR-4-01 — Swap reason label said optional while the contract requires it (blocking)

**Severity:** 🟠 Major  
`contractSwapInputSchema.reason` requires 3–240 characters, yet `contractSwapReason` read
"Lý do (không bắt buộc)". A user could leave it blank and receive a 400 with no field hint.
**Resolution:** label renamed to "Lý do đổi xe" / "Swap reason"; the field is marked required.

### CR-4-02 — Browser sign-in raced the first navigation (blocking)

**Severity:** 🟠 Major  
The login form navigates to `/` before the login request resolves. Three spec-local sign-in
helpers only asserted the URL, so under Sprint 4 parallel load the next `page.goto` aborted the
in-flight login and 12 journeys landed on the login page without cookies.
**Resolution:** `e2e/support/auth.ts` waits for the `/api/auth/login` response before
continuing and the duplicated helpers were removed.

### CR-4-03 — Presentation helpers were untestable from the root Vitest config (blocking)

**Severity:** 🟡 Medium  
`contract-presentation.ts` and `board-presentation.ts` import through the admin `@` alias, which
the root `vitest.config.ts` did not resolve, so no unit test could import them.
**Resolution:** alias added; `tests/admin/contract-presentation.test.ts` covers tones, actions,
active lines, datetime round trips, event descriptions, schedule filters, fleet shares and
business-time formatting.

### CR-4-04 — Vehicle list borrows the dashboard empty-state copy (non-blocking)

**Severity:** 🟢 Minor  
`ViewState` defaults to "Không có việc gấp hôm nay" and a "Xem danh sách xe" link. The vehicle
list shows that copy when a filter has no rows. Sprint 4 added a `copy` prop; the fleet and
customer lists should pass feature-specific copy in a follow-up.

### CR-4-05 — In-process overdue scheduler (non-blocking)

**Severity:** 🟢 Minor  
`overdue-scheduler.ts` evaluates on an interval inside the API process. Evaluation is
idempotent, so duplicate runs are safe, but a multi-instance deployment should add a leader
lock or a database-side scheduler. Documented as a Sprint 4 risk.

### CR-4-06 — Admin bundle exceeds the 500 kB warning (non-blocking)

**Severity:** 🟢 Minor  
The production build emits a 663 kB main chunk. Routes should be code-split before Sprint 5
adds settlement screens.

## Passed Areas

- **State machine:** `contract-lifecycle.policy.ts` is pure; forbidden transitions return 409
  `INVALID_TRANSITION` without side effects; overdue uses `now >= endAt` and the 60-minute grace
  only affects fees.
- **Transactions:** Prisma lifecycle, extension and swap changes run in Serializable
  transactions; cancelled and completed lines stop blocking availability and the partial
  exclusion constraint still protects open lines.
- **History:** every transition appends a contract event with actor, reason and metadata
  (`previousEndAt/newEndAt/previousTotalVnd/newTotalVnd`, `fromVehicleCode/toVehicleCode`,
  `scheduledEndAt`) plus an audit entry; original lines are never mutated after a swap.
- **Pricing:** extension reprices from the contract's pricing version, not the current one; a
  later Owner publication does not change the total.
- **Security:** all lifecycle endpoints sit behind authentication and CSRF; system actor is
  used only by the scheduler; no PII enters logs, demo seeds or fixtures.
- **Frontend:** one component per file, hooks own state/queries, shadcn/Radix primitives only,
  destructive cancel uses the destructive variant with a required reason, dialogs autofocus
  and return focus, mutation errors render in `role="alert"`.
- **Timezone:** board classification, seeds and formatting use Asia/Ho_Chi_Minh over UTC
  persistence; e2e runs with that timezone pinned.

## Gate evidence

- Format: pass
- Lint: pass
- Typecheck (api, admin): pass
- Unit/integration: 111/111 pass
- Coverage: statements 95.06%, branches 81.42%, functions 94.7%, lines 96.36%
- Browser acceptance: 36/36 pass
- Production build: pass
- Prisma schema validation: pass
- Dependency audit: 5 high advisories via transitive `multer` (unused upload middleware);
  requires a major NestJS upgrade, tracked as a follow-up

## Required Re-review

CR-4-01, CR-4-02 and CR-4-03 were fixed and re-verified. CR-4-04 to CR-4-06 are accepted as
documented follow-ups. **Re-review verdict: LGTM.**
