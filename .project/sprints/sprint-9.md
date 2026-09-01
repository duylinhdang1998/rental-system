# Sprint 9: Absolute Import Regression Fix

**Sprint:** 9
**Duration:** Bug fix sprint
**Goal:** Enforce the configured `@/` alias for every application-internal frontend import.
**Status:** COMPLETE — CODE REVIEW LGTM · QA PASS

## Bug Triage

| ID  | Description                                                                | Severity | Expected                               | Actual                                             |
| --- | -------------------------------------------------------------------------- | -------- | -------------------------------------- | -------------------------------------------------- |
| B1  | Frontend source still uses relative imports after architecture remediation | 🟡 Major | Internal imports use `@/` consistently | 192 relative imports remain across 94 source files |

## Sprint Backlog

| ID  | Task                                                               | Points | Status            | Assignee    | Wireframe |
| --- | ------------------------------------------------------------------ | -----: | ----------------- | ----------- | --------- |
| 9.1 | Fix: replace frontend relative imports and add an enforcement gate |      3 | [COMPLETE]        | Frontend    | -         |
| 9.R | Code Review: Sprint 9                                              |      2 | [COMPLETE — LGTM] | Code Review | -         |
| 9.Q | QA: regression and browser verification                            |      3 | [COMPLETE — PASS] | QA          | -         |

## Acceptance Criteria

- [x] No `./` or `../` module specifier remains in `apps/admin/src/**/*.{ts,tsx}`.
- [x] ESLint rejects new relative imports in frontend application source.
- [x] Architecture regression test proves the alias-only boundary.
- [x] Lint, typecheck, unit/integration, build and browser acceptance remain green.
- [x] Code review returns LGTM and QA returns PASS.

## Root Cause

Sprint 8 configured the TypeScript and Vite alias but did not add a lint or architecture
gate that required its use. Existing imports therefore survived the structural refactor.

## Verification Evidence

- Relative imports remaining: `0`; converted: `194` across `94` source files.
- Unit/integration: `66/66` passing.
- Coverage: statements `95.66%`, branches `80.27%`, functions `94.8%`, lines `96.65%`.
- Browser acceptance: `22/22` Playwright scenarios passing.
- Lint, typecheck, build and format: PASS; dependency audit: `0` vulnerabilities.
- Local runtime: frontend and backend health checks return HTTP `200`.
