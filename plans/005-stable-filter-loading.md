# 005 — Keep search and filter controls mounted while fetching

- **Status**: DONE
- **Commit**: 7137a4d
- **Severity**: HIGH
- **Category**: State continuity and interaction stability
- **Estimated scope**: 4 source files and focused browser tests

## Problem

At `app/apps/admin/src/features/customers/pages/CustomerListPage.tsx:11`:

```tsx
if (page.customers.isPending) return <ViewState state="loading" />;
```

`app/apps/admin/src/features/fleet/pages/VehicleListPage.tsx:12` similarly replaces the whole page during pending queries. Their query hooks currently have no placeholder data:

```tsx
// features/customers/hooks/use-customers.ts:6
return useQuery({ queryFn: () => fetchCustomers(search), queryKey: ['customers', search] });
// features/fleet/hooks/use-fleet.ts:6
return useQuery({ queryFn: () => fetchVehicles(filters), queryKey: ['fleet', filters] });
```

On the local UI, searching for VIP caused the customer input to lose focus. Search updates URL/query keys for each input change, so the pending branch unmounts the input. Vehicle navigation also showed an entire-page loading state.

## Target

Header, search, filters and dialog owners remain mounted during initial load, query-key changes and refetch errors. Preserve prior list data with `placeholderData: (previous) => previous` in both hooks, matching `features/audit/hooks/use-audit-events.ts:7`. Put loading/error/empty states only inside a stable results region. Mark results `aria-busy={query.isFetching}`. Distinguish placeholder results from actual matches; use existing localized loading copy for a visible status. Disable record-specific actions while `isPlaceholderData` to prevent acting on stale results, but leave search/filter controls enabled.

No list/page entrance animation: immediate updates, **0ms delay**. No artificial network delay or minimum spinner duration. Keep existing 120ms color feedback; do not fade data on every keystroke.

## Repo conventions to follow

Use TanStack Query already installed, existing query keys and URL filters; reuse ViewState and existing translations. Audit hook already preserves previous data. Keep cached-data semantics explicit rather than showing old results as matching new filters.

## Steps

1. Edit `app/apps/admin/src/features/customers/hooks/use-customers.ts` and `features/fleet/hooks/use-fleet.ts`: add previous-data placeholder function without changing queryFn, keys, mutations or invalidation.
2. Edit `features/customers/pages/CustomerListPage.tsx` and `features/fleet/pages/VehicleListPage.tsx`: remove whole-page pending/error returns; render controls and dialog owners unconditionally; handle pending/error/empty/list branches within the results region. Guard access to data until available.
3. When a background request fails with existing data, retain the data and controls and show a localized retry/error status within results. Initial errors show results-level ViewState.
4. Add `app/e2e/page-continuity.spec.ts`. Delay mocked list GET responses by 700ms in the test only; type multiple characters with keyboard, operate vehicle filters and test errors/empty results. Assert exact query, input focus, persistent input DOM node, URL and updated results. Assert stale result actions cannot run during placeholder data.

## Boundaries

Only the two pages/hooks and new regression tests. No API/auth/business changes, debounce dependency, route transitions or CSS height animation. Broadening to contracts/calendar/report loading requires a separate plan. If current code differs from excerpts or prerequisite changes, report before editing.

## Verification

- **Mechanical** (cwd `app`): `npm.cmd run build --workspace @rental/admin`; `npm.cmd exec -- eslint apps/admin/src e2e/page-continuity.spec.ts --max-warnings=0`; `npm.cmd exec -- playwright test e2e/page-continuity.spec.ts --workers=1`. All pass.
- **Feel check**: At 375px and 1440px, type a search character by character; delay API by 500ms and 1500ms in a test harness. Input/caret/header remain stable, no whole-page flash, and filters work throughout. Test rapid changes, cached revisit, empty results and retry. Under reduced motion behavior remains immediate. At 10% animation playback verify no results entrance effect exists.
- **Done when**: Focus never drops during search; headers and controls never disappear; stale results are marked and cannot trigger incorrect actions.

## Execution result

Implemented on 2026-10-05 alongside user-selected plan 010. Scope expanded to contracts/expenses query filters and stable headers on other primary operational pages. Shared use-stable-search-params keeps draft input immediate during URL navigation and resynchronizes on history/external links, fixing dropped characters found by rapid-typing tests. Background placeholder results remain visible but inert. Verification is consolidated in page-continuity.spec.ts (8 cases), not a separate filter test file. No page animation on filter changes; pointer navigation fade is governed separately by 010.
