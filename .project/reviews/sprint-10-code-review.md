# Sprint 10 UI Foundation — Code Review

**Reviewer:** google-code-reviewer  
**Date:** 2026-09-01  
**Initial verdict:** NEEDS MAJOR  
**Re-review verdict:** LGTM

## Measurement Pass

- **M1 — file length:** 29 files, 654 lines total. Longest files: `SelectField.tsx` 48,
  `App.tsx` 42, `ui-component-showroom.spec.ts` 39. No file exceeds 300 lines.
- **M2 — function length:** longest functions are `App` 26 lines, `SelectField` 24 lines and
  `ButtonVariants` 24 lines. No function exceeds 30 lines.
- **M3 — duplicate scan:** every top-level function/constant was searched by identifier and
  a body literal across `app/**/*.ts(x)`. No declaration has three copied definitions.
  `LINKS` and `SECTIONS` repeat the same seven section IDs/labels in two files. Two unrelated
  `KPI_ITEMS` constants exist, but represent different states and shapes; there is no drift
  for the same product state.
- **M4 — drift:** the duplicated section IDs/labels currently match. The typography specimen
  does drift from the approved design-system source of truth (finding CR-10-01).
- **M5 — installed gates:** `max-lines`, `max-lines-per-function`,
  `react/no-multi-comp` and static-style `no-restricted-syntax` are all present in
  `app/eslint.config.mjs`.

## Findings

### CR-10-01 — Typography specimen contradicts approved tokens (blocking)

**Severity:** 🔴 Critical  
`FoundationTypography.tsx` presents Display as 32/800, Heading as 24/800, Body as 16/400
and Label as 14/700. The approved design system defines 32/700, 22/700, 14/450 and 13/650.
The showroom cannot be an approval source while displaying a second, conflicting scale.

### CR-10-02 — Feature layout bypasses the spacing system (blocking)

**Severity:** 🔴 Critical  
`UiKitPage.tsx` uses the arbitrary grid template
`lg:grid-cols-[12rem_minmax(0,1fr)]`. Feature code is required to use named scale utilities;
the design system explicitly prohibits arbitrary spacing values.

### CR-10-03 — BDD interaction coverage is incomplete (blocking)

**Severity:** 🔴 Critical  
The browser tests do not yet exercise Select, Checkbox and Radio by keyboard, assert focus
visibility/focus trapping, verify the 44px target rule, compare all requested variants/states,
or verify the 768/1024/1440 viewports. The production exclusion test inspects source text but
does not prove the production build omits the route.

### CR-10-04 — Section metadata has two sources (non-blocking)

**Severity:** 🟢 Minor  
`UiKitNavigation.tsx` and `UiKitPage.tsx` separately declare the same seven IDs and labels.
They match today but can drift when sections are renamed. Keep one typed section catalog and
derive both navigation and page composition from it.

### CR-10-05 — Business provider is owned by the UI-kit feature (non-blocking)

**Severity:** 🟢 Minor  
`BusinessProviders.tsx` correctly prevents showroom API calls, but it is a routing concern
stored under `features/ui-kit`. Move it to `routes/` so the development feature does not own
the operational application's provider boundary.

## Passed Areas

- One component per file, absolute `@/` imports and blueprint traceability are enforced.
- No native form controls, static inline styles, `any`, unsafe HTML or new auth boundary.
- shadcn/Radix primitives are reused; Select items are correctly wrapped in `SelectGroup`.
- Mobile overflow root cause is fixed and the dialog returns focus to its trigger.

## Required Re-review

Resolve CR-10-01 through CR-10-05, rerun lint/typecheck and the focused browser suite, then
repeat the measurement pass before requesting LGTM.

## Re-review — 2026-09-01

- **M1:** 31 scoped files, 1,114 lines total; longest file is `styles.css` at 253 lines.
- **M2:** longest application functions are `App` 26, `SelectField` 24 and
  `ButtonVariants` 24 lines. The longest test callback is 29 lines.
- **M3/M4:** section metadata now has one source in `UI_KIT_SECTIONS`; the showroom KPI
  constant is explicitly named `KPI_SPECIMENS`; no three-copy declaration or drift remains.
- **M5:** all four required ESLint gates remain installed and lint passes.
- CR-10-01: resolved with named typography tokens matching the approved scale.
- CR-10-02: resolved with named grid utilities and a named compact radius token.
- CR-10-03: resolved by three focused unit/build assertions and eight browser scenarios.
- CR-10-04: resolved with one typed section catalog.
- CR-10-05: resolved by moving the operational provider boundary to `routes/`.

**Final verdict: LGTM.** No blocking or non-blocking findings remain.
