# 004 — Consolidate dashboard motion tokens

- **Status**: DONE
- **Commit**: 7137a4d
- **Severity**: LOW
- **Category**: Cohesion and tokens
- **Estimated scope**: 1 shared CSS file covering navigation and four control primitives

## Problem

`app/apps/admin/src/styles.css:40–42` declares `--motion-fast: 120ms ease-out; --motion-base: 180ms ease-out; --motion-slow: 240ms cubic-bezier(0.2, 0.8, 0.2, 1);`. Only navigation consumes these, at lines 209–210. Input, textarea, checkbox and table rows use `transition-colors` with Tailwind's unrelated 150ms curve.

## Target

Define `--motion-ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--motion-duration-fast:120ms`, `--motion-duration-press:160ms`, `--motion-duration-base:180ms`, `--motion-duration-slow:240ms`, `--motion-duration-dialog:200ms`, `--motion-duration-select:150ms`. Keep existing shorthand token names as aliases of the corresponding duration and ease-out curve for compatibility. Navigation and `[data-slot='input'],[data-slot='textarea'],[data-slot='checkbox'],[data-slot='table-row']` use fast duration and `ease` for color changes. Keep transition-colors utilities and indicator transition-none intact.

## Repo conventions to follow

Existing tokens live in :root of styles.css. Shared controls expose data-slot, so their timing can be centralized without editing those four TSX files. Navigation transition list remains explicit background-color and color.

## Steps

1. Replace the three shorthand declarations with the exact duration/curve tokens and backward-compatible shorthand aliases described above.
2. Change navigation timing to `var(--motion-duration-fast) ease` for background-color and color.
3. Add the scoped shared-control timing CSS before responsive/reduced-motion rules.
4. Execute plans 001, 003, then 002; validate the combined change, including runtime focus and mobile viewport.

## Boundaries

No list/page entrance effects, no stagger, no LoadingButton or contract wizard additions (these were optional opportunities, outside the four selected findings). No new dependencies or design palette/layout changes. Report source drift before editing.

## Verification

- **Mechanical**: From app, run `npm.cmd run build --workspace @rental/admin`, `npm.cmd exec -- eslint apps/admin/src --max-warnings=0`, and `npm.cmd exec -- vitest run tests/admin`.
- **Feel check**: Hover navigation/table rows, focus inputs, operate checkboxes and buttons. Confirm short consistent color feedback, immediate keyboard response, no list movement, no blocked interaction. At 10% playback verify no layout changes. Repeat at mobile width and reduced motion.
- **Done when**: Computed shared color transitions use 120ms ease and overlay/press timings consume the centralized tokens.
