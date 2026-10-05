# 002 — Respect reduced motion while preserving loading feedback

- **Status**: DONE
- **Commit**: 7137a4d
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 1 CSS file and focused browser regression coverage

## Problem

`app/apps/admin/src/styles.css:273` currently applies `transition-duration: 1ms !important` globally under reduced motion but never changes keyframes. `shared/ui/LoadingScreen.tsx:6` and `shared/ui/ViewState.tsx:28` use `animate-spin`; `shared/ui/LoadingButton.tsx:33` has an aria-hidden spinning icon while its label remains in the accessibility tree.

## Target

Within the existing media query, replace the universal 1ms transition clamp with targeted rules: `.animate-spin { animation: none !important; }`; `.group\/button:active { translate: none !important; }`; `[data-slot='dialog-content'] { --tw-enter-scale: 1; --tw-exit-scale: 1; }`. Preserve fade at the 200ms dialog duration and preserve color feedback. Keep spinner icons present, all existing loading text and aria-busy/accessible labels intact. Opacity-only skeleton pulse may remain. The existing group/button class survives Radix asChild composition, where data-slot can be replaced.

## Repo conventions to follow

styles.css already owns the reduced-motion media query and component data-slot targeting. `ViewState` line 40 sets aria-busy and lines 42–43 expose loading title/body; preserve this pattern.

## Steps

1. Execute plans 004 and 001 first.
2. Update only the existing reduced-motion media query with the explicit rules above; retain `scroll-behavior: auto !important` for all elements and pseudo-elements.
3. Verify installed tw-animate-css zoom variables use `--tw-enter-scale` and `--tw-exit-scale`; override the variables, not the dialog transform or centering translate.
4. Add focused browser regression coverage for reduced-motion spinner and dialog scaling, with loading semantics still present.

## Boundaries

No global animation:none rule, no hiding loading indicators, no changes to fetching/business logic, no dependencies. Report source drift before editing.

## Verification

- **Mechanical**: From app, run `npm.cmd run build --workspace @rental/admin`, `npm.cmd exec -- eslint apps/admin/src e2e --max-warnings=0` and the added focused Playwright test.
- **Feel check**: Emulate prefers-reduced-motion:reduce; check a loading page/button, modal open/close and button press. Spinner remains visible and static; dialog fades without scaling or losing centering; button does not shift. Switch back to no-preference and confirm normal motion returns.
- **Done when**: Computed spinner animation is none, dialog keyframes have no scale change under reduce and standard motion remains functional.
