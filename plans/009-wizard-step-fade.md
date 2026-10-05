# 009 — Add restrained pointer-only wizard step entry

- **Status**: TODO
- **Commit**: 7137a4d
- **Severity**: LOW
- **Category**: Preventing a jarring change
- **Estimated scope**: Wizard presentation wrapper, shared CSS and contract creation regression

## Problem

`app/apps/admin/src/features/contracts/components/ContractWizardContent.tsx:105` replaces step contents immediately:

```tsx
if (wizard.state.step === CUSTOMER_STEP) return customerContent(wizard);
if (wizard.state.step === VEHICLE_STEP) return vehicleContent(wizard, back);
if (wizard.state.step === PRICING_STEP) return pricingContent(wizard, back);
return finalContent(wizard, back);
```

This is source evidence, not a verified poor-feeling runtime transition. Gate implementation on the feel check below: omit the effect if it feels slower or contributes no useful continuity.

## Target

On a step change initiated by pointer/touch, enter the new step with opacity 0→1 for 120ms using `--motion-duration-fast` and `--motion-ease-out` (cubic-bezier(0.23,1,0.32,1)), via @starting-style and CSS transition. No exit wait, overlap, translate, scale, animated height or page animation. Keyboard step changes are immediate (0ms). Reduced motion retains short opacity-only pointer feedback. Preserve shared outer card, scroll and form data. Opacity must never hide keyboard focus.

## Repo conventions to follow

`features/contracts/pages/ContractWizardPage.tsx:28` already supplies a stable outer card; keep it and ContractSummary outside the animated region. Wizard draft lives in use-contract-wizard.ts; do not change validation, step enumeration, API calls or submission. Motion tokens live in styles.css.

## Steps

1. Inspect and manually compare existing customer→vehicle/back transitions at 375px/1440px before implementing; record whether opacity adds useful continuity.
2. In `app/apps/admin/src/features/contracts/pages/ContractWizardPage.tsx`, add a small presentation boundary around ContractWizardContent keyed only by wizard.state.step; do not key outer card, summary or entire wizard state. Put input-origin tracking in a new `features/contracts/components/layout/WizardStepBoundary.tsx` if needed to respect function-length lint. Capture pointer/keyboard origin on stable card; latch origin for each step action, including async completion, and animate only when it was pointer/touch.
3. Add wizard-step scoped opacity transition in styles.css at 120ms/ease-out with @starting-style opacity0, enabled only for pointer-origin step changes. Initial page mount, same-step edits, validation errors and keyboard actions show immediately.
4. Extend `app/e2e/contract-creation.spec.ts` with safe mocked step transitions: mouse next/back, keyboard Enter/back, async quote error, draft persistence and same-step edits. Assert no mutation is repeated and no focus/scroll reset is introduced.

## Boundaries

No route/list animation, stagger, focus animation, new library, width/height tween or quote-number animation. Do not create an actual contract just to test visual transitions. If reliable origin tracking costs disproportionate complexity, defer this LOW item rather than violate the keyboard gate. Report drift.

## Verification

- **Mechanical** (cwd app): `npm.cmd run build --workspace @rental/admin`; `npm.cmd exec -- eslint apps/admin/src e2e --max-warnings=0`; `npm.cmd exec -- playwright test e2e/contract-creation.spec.ts --workers=1`.
- **Feel check**: Compare mouse and keyboard navigation at 375px/1440px. At 10% playback only entering step opacity changes; back/next remains interactive. Draft selection survives, same-step edits never fade, scroll stays stable and keyboard changes are instant. Reduced motion adds no spatial movement. Reject the addition if perceived delay outweighs continuity.
- **Done when**: Pointer-only fade improves observed transitions, with no animation on keyboard changes and no form regressions; otherwise mark DEFERRED with the feel-check reason.
