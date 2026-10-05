# Frontend animation plans

Baseline commit: `7137a4d`. Plans 001–005 and 010 are implemented. Plans 006–009 remain TODO after the user prioritized content rendering during page navigation.

Plans reference the current working tree, which includes the uncommitted implementation of 001–004. HEAD alone does not contain that prerequisite. Preserve these changes and unrelated user skill/lockfile additions when executing later plans.

| Plan | Title | Severity | Status |
| --- | --- | --- | --- |
| 004 | Consolidate dashboard motion tokens | LOW | DONE |
| 001 | Restore Radix overlay motion | MEDIUM | DONE |
| 003 | Restrict shared button transitions | LOW | DONE |
| 002 | Respect reduced motion | MEDIUM | DONE |
| 005 | Keep search/filter controls mounted | HIGH | DONE |
| 006 | Preserve business dialog exit/focus | MEDIUM | TODO |
| 007 | Reserve acquisition form space | MEDIUM | TODO |
| 008 | Fade loading-button feedback | LOW | TODO |
| 009 | Pointer-only wizard step fade | LOW | TODO |
| 010 | Page navigation and data-arrival continuity | HIGH | DONE |

Execute **004 → 001 → 003 → 002** in one isolated worktree. 001/003 depend on 004; 002 depends on the final shared styles and functioning overlay selectors. Run build/lint/admin tests and focused browser regression coverage before integration. Preserve unrelated skill/lockfile changes. No commit or push requested for this task.

## Next execution order

Latest user steering selects page-content rendering as the immediate priority. Execute **005 + 010** first; plans **006–009 remain TODO** and are not part of this implementation. 010 expands continuity handling to primary operational pages and includes intent prefetch, pointer-only content fade and immediate keyboard/history navigation.

005 + 010 are now complete. Final validation: production build, scoped lint, 21 browser regressions; admin suite passed 92 tests during implementation. Real animationstart events verify destination/result opacity entry. Follow-up uses a more visible 300ms keyframe fade (user-requested preview duration), verifies cached-page entry and disables page motion for reduced-motion users; all 8 continuity tests and scoped lint pass. Delayed API tests verify retained controls, complete rapid typing, previous-data safety, URL/history synchronization and cache reuse. Existing 001–004 motion checks and responsive showroom checks also pass.

**005 → 006 → 007 → 008 → 009**. First stabilize interaction and dialog ownership; optional polish comes last. 006 depends on persistent fleet owners from 005; 007 depends on the final shell lifecycle from 006. 008 is independent once shared tokens/reduced-motion support are present. 009 requires an initial feel check and may be deferred if it slows the workflow.

Review evidence: customer search lost focus after typing VIP; vehicle navigation showed a results-replacing loading state; acquisition dialog grew from approximately 139px to 333px when data arrived. Source inspection also found business dialogs removed immediately on close. These observations do not establish dropped FPS. Use delayed/mock API responses in tests to reproduce continuity failures; do not inject artificial delays into production.

Scope boundaries: no route transitions, animated data rows/numbers, stagger, new dependencies or business/API behavior changes. 006 covers fleet acquisition and contract dialog ownership; other conditional shell consumers (cash shifts, expenses, damage catalog) remain follow-up work. Test actual business screens as well as showroom. Run builds/admin production-build tests sequentially to avoid competing writes to dist on Windows.

## Execution result

Implemented and reviewed using the improve-animations execute workflow on 2026-10-05, then integrated into the main workspace. Changed four shared source files and added `app/e2e/motion-regression.spec.ts`.

Runtime review caught Radix asChild replacing a Button's data-slot; the existing group/button class is the stable CSS selector for both ordinary buttons and composed triggers. Overlay class was extracted to a module constant to preserve the repository's function-length lint rule.

Validation passed: frontend production build; scoped frontend/e2e lint; changed-file Prettier; 92 admin tests; 2 motion browser tests; 8 existing showroom and 3 primary-color browser tests. Browser checks verified actual animation-start events/keyframes, dialog exit retention and focus return, opacity-only Select, reduced-motion static loading with accessible labels, centered modal fade and suppressed press translation. Manual Chrome inspection confirmed 200ms dialog, 150ms Select and shared button transitions, including composed triggers. Screenshot: `app/output/animation-review/dialog.png`.

Review verdict: PASS against AUDIT.md. No unresolved test failures. No new dependencies, commit or push.
