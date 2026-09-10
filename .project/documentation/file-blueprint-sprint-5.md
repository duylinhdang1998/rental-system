# Sprint 5 Exact File Blueprint — Return and Settlement

**Status:** APPROVED — reconciled with the Sprint 5 implementation on 2026-09-10
**Architecture:** Extend the approved modular NestJS + React SPA monolith. Per-vehicle returns,
charges and settlement are new use cases inside the contracts module: money math and the late
fee formula live in the shared contracts package so the browser preview and the API snapshot
can never drift; every write is one Serializable transaction plus immutable contract events and
an audit entry. No new service boundary and no new persistence technology.

## Shared contracts and persistence

```text
app/packages/contracts/src/
├── returns.ts                              # Return/charge/settle inputs, inspection, charge, figures, statement
├── settlement.ts                           # settlementFigures + maxDepositApplied (BR-04 money math)
├── late-fee.ts                             # calculateLateReturnFee moved here from the API pricing policy
├── contracts.ts                            # Line inspection, contract charges/settlement, LINE_RETURNED/CHARGE_ADDED/SETTLED events
├── operations.ts                           # Return queue contracts (line kind, per-line late policy, counters)
└── index.ts                                # Public exports

app/apps/api/prisma/
├── schema.prisma                           # Line return columns, ContractCharge, ContractSettlement, new enums/events
└── migrations/202609100001_return_settlement/migration.sql # Forward migration
```

## Backend — contracts module

```text
app/apps/api/src/modules/contracts/
├── contract.module.ts                      # Registers return and settlement services/controller
├── contract-return.controller.ts           # GET returns/queue, GET :id/settlement, POST lines/:lineId/return, charges, settle
├── contract-return.service.ts              # US-016: per-line return, late fee snapshot, condition → fleet, BR-03 completion
├── contract-settlement.service.ts          # US-017: statement, manual charges (BR-06), checklist + deposit cap, settle (BR-07)
├── contract-settlement.policy.ts           # Pure statement items, sums, frozen figures, chargeable statuses
├── return-queue.policy.ts                  # Pure business-time queue classification, ordering and counters
├── contract-lifecycle.policy.ts            # openLines / isFullyReturned helpers
├── contract-lifecycle.controller.ts        # Manual /complete endpoint removed (completion is derived)
├── contract-lifecycle.service.ts           # Complete use case removed
├── contract-extension.service.ts           # Extends open lines only; returned lines keep their price
├── contract-swap.service.ts                # Swaps open lines only; replacement starts without inspection
├── contract.service.ts                     # Detail/list expose settledAt
├── contract-view.ts                        # Shared lookup unchanged, exports open-line helpers
├── operations-board.policy.ts              # Board uses open lines (returned vehicles leave the board)
├── contract.types.ts                       # Repository port: returnLine, addCharge, settle; ReturnChange, ChargeDraft, SettlementDraft
├── demo-contract.builders.ts               # buildCharge/buildSettlement synthetic builders
├── demo-contract.seed.ts                   # Seeds carry charges/settlement defaults (synthetic only)
├── demo-contract.repository.ts             # In-memory returnLine/addCharge/settle with private image keys per line
├── prisma-contract.mapper.ts               # Inspection, charge and settlement mapping
├── prisma-return.writes.ts                 # writeReturn / writeCharge / writeSettlement transaction bodies
└── prisma-contract.repository.ts           # Serializable transactions for return and settlement

app/apps/api/src/modules/pricing/
└── pricing.policy.ts                       # Re-exports the shared late-fee formula
```

## Frontend — contracts and returns features

```text
app/apps/admin/src/
├── App.tsx                                 # /returns now renders the live return queue
├── shared/i18n/i18n.ts                     # Return and settlement copy (VI/EN)
├── features/contracts/
│   ├── api/contracts-api.ts                # fetchSettlement, returnVehicle, addContractCharge, settleContract
│   ├── lib/contract-presentation.ts        # Actions incl. charge/settle, renting/settlement predicates, event describers
│   ├── lib/contract-translations.ts        # New event labels; manual complete copy removed
│   ├── lib/return-form.ts                  # ReturnTarget, return form values, API input, late-fee preview
│   ├── lib/settlement-presentation.ts      # Outcome, figure rows, deposit preview/cap, checklist, charge input
│   ├── lib/settlement-translations.ts      # Return and settlement copy (VI/EN)
│   ├── hooks/use-contract-mutation.ts      # Invalidates return-queue and settlement caches
│   ├── hooks/use-contract-mutations.ts     # activate/cancel/charge/extend/settle/swap mutation bundle
│   ├── hooks/use-contract-detail-page.ts   # Dialog union (action | return target), owner flag, settlement query
│   ├── hooks/use-lifecycle-form.ts         # Typed field change helper
│   ├── hooks/use-return-vehicle.ts         # Per-line return mutation
│   ├── hooks/use-settlement.ts             # Settlement statement query
│   ├── components/detail/ContractActions.tsx        # charge/settle actions; "closed" only once settled
│   ├── components/detail/ContractDetailBody.tsx     # Lines, settlement panel, timeline, overview layout
│   ├── components/detail/ContractLineItem.tsx       # Line status (active/returned/replaced) and return slot
│   ├── components/detail/ContractLineSummary.tsx    # Code, subtotal, period and explanation
│   ├── components/detail/ContractLineReturn.tsx     # Inspection summary or "Nhận xe" button
│   ├── components/detail/ContractLineInspection.tsx # Returned time, condition, fuel, late fee, notes
│   ├── components/detail/ContractLineList.tsx       # Passes the return callback
│   ├── components/detail/TimelineEvent.tsx          # Icons/tones for return, charge and settlement events
│   ├── components/lifecycle/ActivateContractDialog.tsx # Handover confirmation (replaces ConfirmActionDialog)
│   ├── components/lifecycle/LifecycleDialogs.tsx    # Lifecycle dialogs; delegates Sprint 5 dialogs
│   ├── components/lifecycle/NotesField.tsx          # Shared bounded notes textarea
│   ├── components/list/ContractSettlementBadge.tsx  # Settled / pending badge on completed rows
│   ├── components/list/ContractCard.tsx             # Renders the settlement badge
│   ├── components/list/ContractTableRow.tsx         # Renders the settlement badge
│   ├── components/returns/ReturnVehicleDialog.tsx   # US-016 dialog shared with the queue
│   ├── components/returns/ReturnTimeFields.tsx      # Actual return time + late-fee preview
│   ├── components/returns/ReturnLateFeePreview.tsx  # Shared-formula late fee preview
│   ├── components/returns/ReturnInspectionFields.tsx # Condition and fuel level
│   ├── components/returns/ReturnChargeFields.tsx    # Optional inspection charge kind
│   ├── components/returns/ReturnChargeAmountFields.tsx # Inspection charge amount/description
│   ├── components/settlement/SettlementDialogs.tsx  # charge / return / settle dialog switch
│   ├── components/settlement/SettlementPanel.tsx    # Statement panel with status, items and figures
│   ├── components/settlement/SettlementStatus.tsx   # Open vehicles / outcome badge / settled stamp
│   ├── components/settlement/SettlementOutcomeBadge.tsx # Receivable / refund / balanced badge
│   ├── components/settlement/SettlementItemList.tsx # Statement lines with explicit signs
│   ├── components/settlement/SettlementFigureList.tsx # Figure rows and Sprint 6 payment note
│   ├── components/settlement/AddChargeDialog.tsx    # US-017 manual charge dialog
│   ├── components/settlement/ChargeAmountFields.tsx # Amount and description
│   ├── components/settlement/ChargeFields.tsx       # Kind (Owner-only discount) and target line
│   ├── components/settlement/SettleContractDialog.tsx # US-017 settlement dialog
│   ├── components/settlement/SettleDepositField.tsx # Deposit applied with cap and outcome preview
│   ├── components/settlement/SettleChecklistFields.tsx # Document/deposit confirmations and notes
│   ├── pages/ContractDetailPage.tsx        # Detail route composition
│   └── index.ts                            # Exports ReturnVehicleDialog and ReturnTarget
└── features/returns/
    ├── api/returns-api.ts                  # Runtime-validated queue adapter
    ├── lib/queue-presentation.ts           # Sections, tones, grouping, highlights, return target
    ├── lib/return-translations.ts          # Queue copy (VI/EN)
    ├── hooks/use-return-queue.ts           # Queue query with periodic refresh
    ├── hooks/use-return-queue-page.ts      # Selection state for the shared return dialog
    ├── components/queue/ReturnQueueHeader.tsx   # Title, subtitle and generated-at stamp
    ├── components/queue/ReturnQueueSummary.tsx  # Overdue / due today / renting KPI cards
    ├── components/queue/ReturnQueueList.tsx     # Sections in work order
    ├── components/queue/ReturnQueueSection.tsx  # One urgency section
    ├── components/queue/ReturnQueueItemCard.tsx # One contract with its open lines
    ├── components/queue/ReturnQueueItemHeading.tsx # Code link, customer and urgency badge
    ├── components/queue/ReturnQueueLineRow.tsx  # One open vehicle line with "Nhận xe"
    ├── pages/ReturnQueuePage.tsx           # Route composition with loading/empty/error states
    └── index.ts                            # Public feature exports
```

Removed: `features/contracts/components/lifecycle/ConfirmActionDialog.tsx` and
`features/returns/pages/ReturnQueuePreview.tsx` (the Sprint 1 preview).

## Tests

```text
app/
├── vitest.config.ts                        # 30s hook/test timeouts for parallel NestJS boots
├── tests/domain/support/contract-fixture.ts     # Inspection, charge and settlement fixtures (synthetic)
├── tests/domain/contract-settlement.test.ts     # Golden money examples, statement items, frozen figures
├── tests/domain/return-queue.test.ts            # Business-time classification, ordering and counters
├── tests/api/support/lifecycle-client.ts        # Handover overrides and open-line lookup
├── tests/api/contract-returns.test.ts           # Partial return, late-fee table, condition → fleet, validation, queue, auth/CSRF
├── tests/api/contract-settlement.test.ts        # Charges (BR-06), checklist, deposit cap, freeze (BR-07), partial deposit
├── tests/api/contract-lifecycle.test.ts         # Completion now derived from the last return
├── tests/infrastructure/prisma-sprint5.repositories.test.ts # writeReturn/writeCharge/writeSettlement and inspection mapping
├── tests/infrastructure/prisma-sprint3.repositories.test.ts # Records carry charges
├── tests/infrastructure/prisma-sprint4.repositories.test.ts # Records carry return columns and settlement
├── tests/admin/settlement-presentation.test.ts  # Actions, describers, return form, settlement rows, queue presentation
├── tests/admin/contract-presentation.test.ts    # Updated action matrix
├── e2e/support/contracts.ts                     # Optional deposit override for seeded contracts
├── e2e/contract-lifecycle.spec.ts               # Handover → late return → refund settlement journey
├── e2e/return-settlement.spec.ts                # Queue → two returns + damage charge → receivable settlement
└── e2e/workspace-navigation.spec.ts             # /returns is a live module
```

## Dependency rules

- Controllers depend on services and shared Zod contracts only; the return controller keeps
  `returns/queue` as two static segments so it never collides with `GET :id`.
- Return and settlement services depend on repository ports, pure policies, the fleet port, the
  vehicle synchronization service and the audit service.
- Money math (`settlementFigures`, `maxDepositApplied`) and the late-fee formula are imported
  from `@rental/contracts` by both the API and the admin; neither side re-implements them.
- Only Prisma adapters import Prisma; `prisma-return.writes.ts` holds transaction bodies only.
- Demo repositories keep inspection image keys outside API responses; only counts are exposed.
- All files remain below 300 lines and all functions below the effective 30-line lint limit.

## Data invariants

- A line can be returned once, only while the contract is ACTIVE or OVERDUE, at a moment not
  before the line start and not in the future (5-minute tolerance).
- Late fee = `ceil(max(0, late − grace) / 60 min) × hourlyRate` from the line snapshot and is
  stored as an immutable LATE_RETURN charge in the same transaction.
- The contract completes when its last open line is returned; `completedAt` equals that
  return time. Early return never refunds unused days.
- Condition MAINTENANCE/DAMAGED moves the vehicle to that status before schedule sync;
  GOOD derives AVAILABLE/RESERVED/RENTED from remaining holds.
- Charges are allowed for ACTIVE/OVERDUE/COMPLETED contracts until `settledAt` is set;
  DISCOUNT requires the OWNER role.
- Settlement requires COMPLETED and unsettled; `depositApplied ≤ min(deposit, outstanding)`;
  retained document and any refund must be confirmed explicitly; the figures are frozen on the
  contract and later statements read the snapshot.
- `paidVnd` is 0 until the Sprint 6 payment ledger; the UI states this next to the figures.
