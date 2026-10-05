# 007 — Reserve acquisition form space before data arrives

- **Status**: TODO
- **Commit**: 7137a4d
- **Severity**: MEDIUM
- **Category**: Preventing a jarring change
- **Estimated scope**: Acquisition dialog, new skeleton, shared CSS and browser tests

## Problem

`app/apps/admin/src/features/fleet/components/acquisition/VehicleAcquisitionDialog.tsx:24` mounts a short loading paragraph, then line 31 mounts a full VehicleAcquisitionForm:

```tsx
{view.isPending ? (
  <p className="flex items-center gap-2 text-ink-muted" role="status">
    <LoaderCircle aria-hidden className="size-4 animate-spin" />
    {t('acquisitionLoading')}
  </p>
) : null}
```

Local review measured dialog height approximately 139px during loading and 333px after form appeared. This geometry jump is distinct from the now-working modal entrance.

## Target

Replace the compact loading paragraph with a skeleton reserving the same four-field/actions layout as the actual empty acquisition form. Reuse the real field wrapper sizing/gaps at each breakpoint; no arbitrary fixed 333px height. The successful form enters via opacity 0→1, 180ms `var(--motion-duration-base) var(--motion-ease-out)`; curve cubic-bezier(0.23,1,0.32,1). Use `@starting-style` plus opacity transition; browsers without support simply show content. Do not animate height/width, scale dialog contents, overlay two active forms or delay data availability. Reduced motion retains opacity-only 180ms fade.

## Repo conventions to follow

`features/fleet/components/acquisition/VehicleAcquisitionForm.tsx` uses `grid gap-4`; VehicleAcquisitionFields specifies four existing controls; FormActions supplies button sizing. Existing PricingSettingsState uses noninteractive skeleton blocks. Existing colors/radii/tokens live in styles.css. Loading copy stays a role=status message, skeleton blocks aria-hidden. Do not create an editable default form before stored cost arrives.

## Steps

1. After 006, inspect `VehicleAcquisitionFields.tsx`, `VehicleAcquisitionForm.tsx`, `AcquisitionPreview.tsx` and `shared/ui/FormActions.tsx` to copy the exact responsive grid and block sizes into new `features/fleet/components/acquisition/AcquisitionFormSkeleton.tsx`. Skeleton must reserve the actual initial blank-form geometry including action row, not data-dependent preview/error space.
2. Replace pending paragraph in VehicleAcquisitionDialog with skeleton plus accessible loading text; keep error/retry behavior, query logic and real form keyed to stored data.
3. Add a class on successful content, e.g. acquisition-content, and scoped opacity transition in `app/apps/admin/src/styles.css`: `opacity:1; transition:opacity var(--motion-duration-base) var(--motion-ease-out)` plus `@starting-style { .acquisition-content { opacity:0; } }`.
4. Extend business-dialog browser coverage with delayed GET acquisition, null/stored data/error and cached reopen. Compare pre/post-success bounding boxes after modal entrance finishes, at 375px and 1440px. No global CSS min-height affecting all dialogs.

## Boundaries

No query prefetch requirement, form business rule changes, new dependency, fake editable fields or display of zero defaults before data load. Exact geometry follows current form, not the review viewport measurement. Preserve field initial-focus behavior; focus input only once it exists. Report drift.

## Verification

- **Mechanical** (cwd app): `npm.cmd run build --workspace @rental/admin`; `npm.cmd exec -- eslint apps/admin/src e2e --max-warnings=0`; `npm.cmd exec -- playwright test e2e/business-dialog-motion.spec.ts --workers=1`.
- **Feel check**: Delay GET by 1500ms in tests only. Open dialog, observe placeholder then form; header/close position and initial blank-form bounds remain stable. At 10% playback inspect opacity only. Reduced motion preserves loading text/static indicators and fade; no layout animation. Stored optional preview may legitimately increase content; do not conceal it.
- **Done when**: Pending→initial blank form changes total height by at most 4 CSS px at each tested viewport, and no premature form defaults appear.
