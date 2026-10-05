# 008 — Smooth loading feedback without changing button size

- **Status**: TODO
- **Commit**: 7137a4d
- **Severity**: LOW
- **Category**: State indication
- **Estimated scope**: LoadingButton, shared CSS and regression test

## Problem

`app/apps/admin/src/shared/ui/LoadingButton.tsx:29,33` toggles label opacity instantly and inserts/removes spinner:

```tsx
className={`inline-flex items-center justify-center gap-2 ${loading ? 'opacity-0' : ''}`}
{loading ? <LoaderCircle aria-hidden className="absolute animate-spin" /> : null}
```

Existing layout preserves button width via hidden label and aria-busy remains correct. Preserve both.

## Target

Keep label and aria-hidden spinner mounted; transition their opacity in opposite directions for 120ms with existing `--motion-duration-fast` and `--motion-ease-out` (cubic-bezier(0.23,1,0.32,1)). Spinner stays absolute and pointer-events:none, animate-spin only while loading. Loading state disables submit immediately; never wait for animation to begin/end before requesting or completing work. Preserve accessible name, caller event handlers/ref behavior and disabled props. Reduced motion uses existing static spinner and same gentle opacity fade. Keyboard-originated submission feedback changes immediately (0ms), with its origin tracked locally by pointer/keyboard capture; do not overwrite caller handlers.

## Repo conventions to follow

LoadingButton uses ShadcnButton and existing relative/absolute layout. styles.css owns motion/reduced-motion tokens. Use dedicated child classes rather than Button data-slot (Radix asChild may replace it).

## Steps

1. Edit `app/apps/admin/src/shared/ui/LoadingButton.tsx`: retain both child nodes, give content and indicator dedicated classes, toggle opacity. Conditional animate-spin stops rotation when idle. Do not set display:none or aria-hidden on label.
2. Add scoped child opacity transitions in styles.css: 120ms cubic-bezier(0.23,1,0.32,1), no size/transform/color transition. Track keyboard vs pointer submission origin inside this component; keyboard origin overrides child transition-duration to 0ms until that submission completes. Caller handlers still run unchanged.
3. Extend `app/e2e/motion-regression.spec.ts` to operate a real submit flow with mocked 500ms success/error/fast responses. Assert stable width, readable accessible name, immediate disabled state and no duplicate submit; rapid changes retarget opacity transitions rather than restarting keyframes.

## Boundaries

No shared Button press changes, minimum loading duration, success celebration, timers or fetching/business logic edits. Do not add a public loading-delay API. Report source drift.

## Verification

- **Mechanical** (cwd app): `npm.cmd run build --workspace @rental/admin`; `npm.cmd exec -- eslint apps/admin/src e2e/motion-regression.spec.ts --max-warnings=0`; `npm.cmd exec -- playwright test e2e/motion-regression.spec.ts --workers=1`.
- **Feel check**: Pointer-submit with slow/fast/error responses, repeated clicks and keyboard Enter. At 10% playback confirm opacity-only transition and unchanged label/width. Keyboard feedback is immediate. Reduced motion keeps static spinner, accessible loading and fade for pointer submission.
- **Done when**: No label/spinner hard swap for pointer submission; width/name remain stable and no request gains animation-induced latency.
