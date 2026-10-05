# 006 — Preserve business dialogs until close completes

- **Status**: TODO
- **Commit**: 7137a4d
- **Severity**: MEDIUM
- **Category**: Exit continuity and focus restoration
- **Estimated scope**: Fleet acquisition and contract dialog owners, their dialog prop chains, one shared shell, regression tests

## Problem

`app/apps/admin/src/features/contracts/components/lifecycle/LifecycleDialogShell.tsx:20` keeps Radix permanently open:

```tsx
<Dialog onOpenChange={(open) => (open ? undefined : props.onClose())} open>
```

`features/fleet/components/list/FleetDialogs.tsx:23` conditionally renders acquisition dialog and passes `onClose={() => dialogs.setAcquisitionTarget(null)}`. Contract owner `features/contracts/hooks/use-contract-detail-page.ts:30` immediately resets mutations and calls `setDialog(null)`. Therefore closing removes the dialog tree before Radix can transition to closed. The showroom regression covers a different, persistently mounted owner and does not prove these feature dialogs work.

## Target

Separate selected target from open state: retain target during closure, set open=false on close request, clear target/reset mutations only after Radix close autofocus lifecycle. Preserve current 200ms fade and 0.95 scale with `--motion-ease-out: cubic-bezier(0.23, 1, 0.32, 1)`. Under reduced motion use existing fade-only overrides at 200ms. Do not introduce another animation or timeout.

Add optional `open?: boolean` (default true for backward compatibility) and `onAfterClose?: () => void` through LifecycleDialogShell and LifecycleFormDialog. Shell uses `open={props.open ?? true}` and calls onClose when Radix requests close. Shell forwards onAfterClose from DialogContent.onCloseAutoFocus after default focus behavior; do not preventDefault indiscriminately. For feature dialogs without a Radix Trigger, capture the actual opening element and explicitly restore focus if it remains connected; otherwise use the stable page heading as a documented fallback.

## Repo conventions to follow

Shared DialogContent already has correct state selectors and token timing in the working tree. VehicleCreateDialog is persistently mounted and controlled via open/onOpenChange; imitate separation of state. Keep `focusDialogPrimaryField` on opening. Optional shell props preserve unrelated cash-shift, expense and damage-dialog callers.

## Steps

1. Prerequisite: plan 005 prevents fleet owner removal while queries change. Inspect existing uncommitted plans 001–004 implementation before editing.
2. Extend `app/apps/admin/src/features/fleet/hooks/use-fleet-dialogs.ts`: acquisitionOpen flag, openAcquisition(vehicle), closeAcquisition() setting only open false, finishAcquisitionClose() clearing target. Reject/disable opening another target during closure. Wire `VehicleListPage.tsx`, `FleetDialogs.tsx`, `VehicleAcquisitionDialog.tsx` to pass open/onAfterClose; all form cancel/success paths use closeAcquisition, not clearTarget.
3. Extend `features/contracts/hooks/use-contract-detail-page.ts`: keep selected dialog, add dialogOpen; openDialog/openReturn capture invoking focus and set selection/open. closeDialog only closes; finishDialogClose resets mutations and clears selection. Clear/reset once and protect against old completion clearing a newly opened target.
4. Extend `features/contracts/components/detail/ContractDetailContent.tsx`, `lifecycle/LifecycleDialogs.tsx`, `settlement/SettlementDialogs.tsx` to forward open/onAfterClose through every selected dialog branch.
5. Forward those optional props through contract leaf wrappers: `lifecycle/{ActivateContractDialog,CancelContractDialog,ExtendContractDialog,SwapVehicleDialog}.tsx`, `payments/PaymentDialog.tsx`, `settlement/{DepositRefundDialog,AddChargeDialog,SettleContractDialog}.tsx`, `returns/ReturnVehicleDialog.tsx`; then `lifecycle/LifecycleFormDialog.tsx` and `LifecycleDialogShell.tsx`. Existing onClose passed into submit/cancel handlers remains the close request callback.
6. Add `app/e2e/business-dialog-motion.spec.ts`: delayed animation playback in test, assert actual closed-state animationstart while node remains connected, eventual removal, opener focus and safe rapid reopen. Exercise acquisition Cancel/Escape/X and representative contract dialogs with mocked safe mutation responses; do not submit real transactions.

## Boundaries

Do not migrate cash-shift, expense or damage-dialog owners in this plan; optional defaults preserve them and a later audit can extend coverage. No forced mount after exit, setTimeout(200), business mutation changes, synthetic history changes or DOM-wide inert hacks. Preserve focus trap/Escape/outside dismissal and aria labels. Report source drift.

## Verification

- **Mechanical** (cwd app): `npm.cmd run build --workspace @rental/admin`; `npm.cmd exec -- eslint apps/admin/src e2e --max-warnings=0`; `npm.cmd exec -- playwright test e2e/business-dialog-motion.spec.ts e2e/motion-regression.spec.ts --workers=1`.
- **Feel check**: Open actual fleet acquisition/contract payment dialogs; Cancel, X, Escape and outside click all fade out before removal. At 10% playback inspect connected node through exit. Reopen rapidly; no stale target, duplicated callback or orphan overlay. Repeat reduced motion and 375px; fade remains, centering/focus remain correct.
- **Done when**: Business dialogs, not only showroom, produce real exit animations and restore focus with no stale mutation errors.
