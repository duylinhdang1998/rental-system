# Sprint 1 Code Review — Daniel Park

**Status:** COMPLETE — LGTM  
**First review:** 2026-08-31  
**Final review:** 2026-09-01

## Measurement pass

- M1: 1,433 source lines; largest file `auth.service.ts` = 93; files over 300 = 0.
- M2: 121 functions; functions over 30 lines = 0. Longest: `SessionProvider` 24, `buildAccounts` 22, `LoginForm` 21.
- M3: 88 top-level declarations searched by identifier and distinctive literal. `MILLISECONDS_PER_MINUTE` has 3 declarations; blocking duplicate.
- M4: the three time constants currently agree at 60,000; no value drift. BDD/implementation drift is listed below.
- M5: `naming-convention`, `max-lines`, `max-lines-per-function`, `no-multi-comp`, and `no-restricted-syntax` resolve in the effective ESLint config.

## Blocking findings

1. Demo preview data is embedded in React and `/api/demo/dashboard` is not authenticated. The approved flow requires session resolution, role policy, and API-served demo view models.
2. Owner-only direct routes are denied only by React. The BDD contract requires protected API status 403 for Staff on reports, employees, and settings.
3. No implementation/test for locked Staff login and invalidating an earlier session.
4. No implementation/test for dashboard loading, empty, and error fixtures with a stable shell and meaningful recovery action.
5. Rate limiting has no safe security event and keys only client IP, while the contract requires account + client policy.
6. Three copies of `MILLISECONDS_PER_MINUTE` violate the shared-constant gate.
7. The exact Sprint 1 file blueprint does not match implemented source files and was not updated before additions.

## Non-blocking observations folded into fixes

- Add a real unapproved-origin CORS integration assertion, not configuration-only coverage.
- Preserve the verified response allow-list that prevents credential hashes from reaching JSON.
- Continue using design tokens only; no static inline styles or component-count violations found.

## Final re-review

- M1: 2,337 source lines; largest file `i18n.ts` = 111; files over 300 = 0.
- M2: 162 functions; functions over 30 lines = 0; longest = 29 lines.
- M3: `MILLISECONDS_PER_MINUTE`, `PREVIEW_SPRINTS` and `USER_ROLES` each have one declaration.
- M4: no duplicate-value drift; exact file blueprint reconciled after component extraction.
- M5: all effective naming, size, component-count and restricted-syntax rules pass with zero warnings.
- All seven blocking findings were fixed and regression-tested.
- CORS origin rejection, locale-aware dates/labels and timezone-aware PostgreSQL timestamps were added.
- Prettier-exposed long components were split without adding lint suppressions.
- Security controls trace to integration tests; managed edge WAF/DDoS and shared multi-replica throttling remain go-live infrastructure gates.

## Verdict

**LGTM** — approved for Sprint 1 QA and closure.
