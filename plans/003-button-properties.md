# 003 — Restrict shared button transitions

- **Status**: DONE
- **Commit**: 7137a4d
- **Severity**: LOW
- **Category**: Performance
- **Estimated scope**: 2 files

## Problem

`app/apps/admin/src/components/ui/button.tsx:8` contains `transition-all` and `active:not-aria-[haspopup]:translate-y-px`. Transition-all can accidentally animate layout properties or focus changes supplied by callers. Press feedback already exists and should remain.

## Target

Remove `transition-all` from the shared class string. Add `.group\/button` CSS with an explicit property list `background-color, color, border-color, opacity, translate`, a 120ms `var(--motion-duration-fast)` duration and `ease` easing. Give translate its own 160ms duration and `var(--motion-ease-out)` curve using comma-separated lists matching the five properties. Keep focus rings immediate; never animate width, height, padding or box-shadow.

## Repo conventions to follow

Button already has the stable `group/button` class at line 8, and global tokens live in styles.css. Match that existing class (slash escaped in CSS). Runtime vetting showed `DialogTrigger asChild` replaces Button's data-slot with `dialog-trigger`, so data-slot is not a reliable Button styling hook.

## Steps

1. Execute plan 004 first.
2. Remove only `transition-all` from button.tsx.
3. Add the scoped transition CSS with durations `120ms,120ms,120ms,120ms,160ms` via the fast/press tokens and easing `ease,ease,ease,ease,var(--motion-ease-out)`.

## Boundaries

No new press-scale effect, no markup or variant changes, preserve aria-haspopup exemption and focus/disabled behavior. Report source drift before editing.

## Verification

- **Mechanical**: From app, run `npm.cmd run build --workspace @rental/admin` and `npm.cmd exec -- eslint apps/admin/src --max-warnings=0`.
- **Feel check**: Hover/press/release primary, outline and icon buttons repeatedly; interruption retargets naturally. At 10% playback verify only color/opacity/translate transitions; tab focus ring appears immediately. Under reduced motion verify no press displacement.
- **Done when**: Browser computed transition-property excludes all/layout properties, press translation remains for ordinary buttons and reduced-motion suppresses it.
