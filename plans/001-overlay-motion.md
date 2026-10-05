# 001 — Restore Radix overlay motion

- **Status**: DONE
- **Commit**: 7137a4d
- **Severity**: MEDIUM
- **Category**: Integration, easing and duration
- **Estimated scope**: 3 files

## Problem

`app/apps/admin/src/components/ui/dialog-content.tsx:19,22` and `app/apps/admin/src/components/ui/select-content.tsx:11` currently declare `data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0`. Dialog also uses `data-open:zoom-in-95 data-closed:zoom-out-95`. Installed Radix emits `data-state="open|closed"`, so these selectors never match.

## Target

Replace every `data-open:` with `data-[state=open]:` and every `data-closed:` with `data-[state=closed]:` in these two files. Preserve dialog scale 0.95, centered origin and existing opacity keyframes. Select stays opacity-only. Add shared CSS selectors `[data-slot='dialog-content']`, `[data-slot='dialog-overlay']` with `animation-duration: var(--motion-duration-dialog)` and `[data-slot='select-content']` with `animation-duration: var(--motion-duration-select)`. All use `animation-timing-function: var(--motion-ease-out)`. Tokens from plan 004 are 200ms, 150ms and cubic-bezier(0.23, 1, 0.32, 1).

## Repo conventions to follow

Global CSS tokens live in `app/apps/admin/src/styles.css:40`. Primitives already expose `data-slot`, e.g. dialog content line 25. Add `data-slot="dialog-overlay"` to the overlay rather than changing markup.

## Steps

1. Execute plan 004 first, then replace the state variants in both primitive files.
2. Add overlay data-slot and the three scoped duration/easing CSS rules above in styles.css.
3. Inspect installed Radix Presence behavior: Dialog supports exit retention; Select may unmount immediately. Do not add custom state management to force a Select exit animation.

## Boundaries

No dependencies, layout changes, scale-from-zero, blur animation or feature-specific overlays. Keep focus trapping, portal behavior, escape dismissal and existing dialogs intact. If source has drifted from the commit, report the drift before editing.

## Verification

- **Mechanical**: From `app`, run `npm.cmd run build --workspace @rental/admin` and `npm.cmd exec -- eslint apps/admin/src --max-warnings=0`.
- **Feel check**: Open/close a dialog by button, Escape and outside click; verify enter/exit animation and eventual removal, including rapid reopen. Open a filter and primary color Select, verify 150ms fade and unchanged selection/focus behavior. Slow animation playback to 10% and verify centered dialog scale 0.95 without displacement.
- **Done when**: Runtime computed animation names are non-none on open, Dialog exits then unmounts, Select selection works; plan 002 removes zoom under reduced motion.
