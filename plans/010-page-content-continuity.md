# 010 — Smooth page navigation and data arrival

- **Status**: DONE
- **Commit**: 7137a4d
- **Severity**: HIGH
- **Category**: Rendering continuity, perceived responsiveness
- **Estimated scope**: Shared shell/loading/query region, core page headers and intent prefetch

## Problem

User clarified that the main issue is content appearing abruptly while switching pages. `app/apps/admin/src/shared/layout/AppShell.tsx` originally rendered `<Outlet />` directly. Many feature pages replaced their whole content with `<ViewState state="loading" />`, removing headers and filters. URL-driven controlled search also lost typed characters during rapid React Router transitions, even after preserving focus.

## Target

Keep the existing shell mounted. Show actual destination headers immediately on the primary list/dashboard pages; use results skeletons for pending data and a dashboard skeleton matching the KPI/two-column layout. Generic page loading fallback shows destination title and results placeholders. Reserve a stable content minimum height `min(36rem, 70dvh)` and scrollbar gutter.

Pointer/touch navigation uses an opacity-only 300ms CSS keyframe entrance (user-requested preview duration) with cubic-bezier(0.215,0.61,0.355,1); delayed result content uses the same entrance. Keyframes start at opacity 0 and finish at 1, including cached destinations. Keyboard/history navigation is immediate, and search parameter changes never restart the page entrance. Reduced motion disables these entrances entirely.

Prefetch only when a visible navigation link receives hover/focus/pointerdown. Reuse TanStack Query keys and its existing 30-second stale-time cache for overview, fleet, customers, contracts, returns, receivables, expenses and employees. Do not prefetch all destinations eagerly or add network/spinner delays.

## Repo conventions to follow

React Router BrowserRouter, TanStack Query and CSS motion tokens are already installed. Shared hooks live in `shared/hooks`; feature components have dedicated workflow folders. Plan 001–004 changes are uncommitted prerequisites in the current workspace. No new dependencies.

## Steps

1. Add `shared/ui/{QueryRegion,ResultsSkeleton,PageSkeleton}.tsx`. QueryRegion renders loading/error/data only within results, preserves old data during background updates, and marks placeholder content inert to block stale record actions.
2. Keep headers/filters mounted on `features/{fleet,customers,contracts,expenses,employees,audit,returns,finance}/pages` and overview. Existing reporting/settings headers already render outside their loading bodies. Add dedicated dashboard loading geometry.
3. Add `shared/hooks/use-stable-search-params.ts` for fleet/customer/contract/expense filter hooks. Maintain immediate local URLSearchParams; recognize internally tagged URL updates; resynchronize on POP/external navigation. Clone parameters before calling functional updaters. This prevents rapid input from being overwritten by intermediate URL navigation.
4. Add `routes/route-prefetch.ts` and `shared/hooks/use-navigation-prefetch.ts`; wire desktop/mobile navigation. Expense prefetch uses the existing expenseQueryFrom builder and limit, not a second default query shape.
5. Add `shared/hooks/use-page-motion.ts` and a pathname-keyed presentation wrapper in AppShell. Only plain internal pointer navigation marks an entrance; keyboard, modifiers and popstate do not. Keep main/sidebar/header outside the keyed wrapper.
6. Add scoped CSS opacity keyframes with reduced-motion overrides. Content-only fade occurs on its initial mount after a pointer navigation, not on every query data change or character typed.
7. Add `app/e2e/page-continuity.spec.ts` with delayed GET responses in tests only, cache/request counts, real animationstart events and initial opacity, rapid typing, history/direct-link resync, failure/recovery and mobile/reduced-motion coverage.

## Boundaries

User-selected scope replaces execution of plans 006–009 for now. Do not add wizard/loading-button motion, migrate business-dialog owners, animate table rows/numbers or mutate APIs. No commits/push requested. Preserve unrelated user skill/lockfile changes.

## Verification

- **Mechanical** (cwd app): `npm.cmd run build --workspace @rental/admin`; `npm.cmd exec -- eslint apps/admin/src e2e/page-continuity.spec.ts --max-warnings=0`; `npm.cmd exec -- vitest run tests/admin`; `npm.cmd exec -- playwright test e2e/page-continuity.spec.ts e2e/motion-regression.spec.ts e2e/ui-component-showroom.spec.ts e2e/frontend-remediation.spec.ts --workers=1 --reporter=line`. Builds and the admin production-build test run sequentially.
- **Feel check**: Switch core pages by mouse and keyboard, revisit cached pages, search rapidly with 700ms API delay, test Back/Forward and clear filters. Headers/inputs persist, no dropped characters/focus, no repeated page fade on typing. At 10% playback inspect opacity-only entry; animationstart regression proves both destination and delayed content animate, including cached destinations. At 375px/reduced motion, controls remain usable and content does not overflow. Manual Chrome check verifies VIP search retains focus and correct results.
- **Done when**: Build/lint and regressions pass, actual opacity animations run, cache reuse avoids duplicate requests and interrupted input/rendering behavior is resolved.

## Execution result

Implemented on 2026-10-05. Final frontend production build and scoped frontend/new-test lint pass. All 21 selected Playwright tests pass, including 8 new continuity cases, 2 motion, 8 showroom and 3 frontend-remediation cases. Admin suite passed 92 tests during this implementation. Manual Chrome review confirms search retains focus and renders correct VIP results. Existing bundle-size advisory remains; no measured FPS claim, new dependencies, commit or push.
