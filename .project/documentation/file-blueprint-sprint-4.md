# Sprint 4 Exact File Blueprint — Contract Lifecycle and Daily Operations

**Status:** APPROVED — reconciled with the Sprint 4 implementation on 2026-09-09
**Architecture:** Extend the approved modular NestJS + React SPA monolith. Lifecycle rules are
pure policies, each use case is one service, and every transition is an immutable contract
event plus an audit entry. No new service boundary and no new persistence technology.

## Shared contracts and persistence

```text
app/packages/contracts/src/
├── contracts.ts                            # Statuses incl. OVERDUE, events, cancel/extend/swap inputs, list query
├── operations.ts                           # Operations board item/fleet-summary contracts
├── time.ts                                 # Business-day helpers for Asia/Ho_Chi_Minh over UTC
└── index.ts                                # Public contract exports

app/apps/api/prisma/
├── schema.prisma                           # Lifecycle stamps, contract events, linked lines, hold flag
└── migrations/202609090001_contract_lifecycle/migration.sql # Forward migration and partial exclusion

app/apps/api/src/common/reservations/
└── reservation-registry.ts                 # Demo holds released on cancel/complete and re-derived after swap
```

## Backend — contracts module

```text
app/apps/api/src/modules/contracts/
├── contract.module.ts                      # Lifecycle services, scheduler and repository selection
├── contract.controller.ts                  # Availability, create, list, board, detail and PDF boundary
├── contract-lifecycle.controller.ts        # evaluate/activate/cancel/complete/extend/swap endpoints
├── contract.service.ts                     # Creation, list and detail use cases
├── contract-view.ts                        # Shared contract lookup and read helpers
├── contract-lifecycle.policy.ts            # Pure transition matrix, overdue boundary and hold derivation
├── contract-lifecycle.service.ts           # Activate, cancel, complete and idempotent overdue evaluation
├── contract-extension.service.ts           # US-014 conflict check and whole-period repricing from snapshot
├── contract-swap.service.ts                # US-015 linked vehicle swap with inherited price and period
├── operations-board.policy.ts              # Pure business-time board classification, sort and fleet summary
├── contract-board.service.ts               # Today/overdue board composition
├── overdue-scheduler.ts                    # Interval-based overdue evaluation under the system actor
├── vehicle-sync.service.ts                 # Derives AVAILABLE/RESERVED/RENTED from open holds
├── contract.types.ts                       # Repository port: lifecycle patch, extend, swap, list, holds
├── contract.tokens.ts                      # Repository injection token
├── contract-pdf.service.ts                 # Bilingual PDF from active lines of the snapshot
├── demo-contract.seed.ts                   # Synthetic ACTIVE/CONFIRMED seeds outside NODE_ENV=test
├── demo-contract.repository.ts             # In-memory adapter with lifecycle, extend and swap
├── prisma-contract.mapper.ts               # Prisma record to contract, events and list mapping
└── prisma-contract.repository.ts           # Serializable transactions for lifecycle, extend and swap

app/apps/api/src/modules/fleet/
├── fleet.types.ts                          # Repository port gains single-vehicle lookup
├── fleet.module.ts                         # Exports the repository for contract synchronization
├── fleet.service.ts                        # Status synchronization entry point
├── demo-fleet.repository.ts                # Demo vehicle lookup and derived status
└── prisma-fleet.repository.ts              # PostgreSQL vehicle lookup and status update

app/apps/api/src/modules/pricing/
├── pricing.types.ts                        # Repository port gains snapshot version lookup
├── pricing.policy.ts                       # Price explanation and repricing by final tier
├── pricing.service.ts                      # Extension repricing from the contract pricing version
├── demo-pricing.repository.ts              # Demo pricing version lookup
└── prisma-pricing.repository.ts            # PostgreSQL pricing version lookup
```

## Frontend — contracts and dashboard features

```text
app/apps/admin/src/
├── App.tsx                                 # /contracts list, /contracts/new wizard, /contracts/:id detail
├── components/ui/progress.tsx              # Native progress primitive styled by design tokens
├── styles.css                              # Progress track tokens
├── shared/api/demo-api.ts                  # Demo dashboard fetch removed
├── shared/i18n/i18n.ts                     # Dashboard, KPI and schedule copy
├── shared/i18n/locale.ts                   # formatTime in business time
├── shared/ui/FormActions.tsx               # Disabled state and destructive save variant
├── shared/ui/LoadingButton.tsx             # Button variant pass-through
├── shared/ui/StatusBadge.tsx               # Neutral tone for closed records
├── shared/ui/ViewState.tsx                 # Custom copy for empty states
├── features/fleet/components/calendar/AvailabilityDay.tsx # Navigates to /contracts/new
├── features/contracts/
│   ├── api/contracts-api.ts                # List, detail and lifecycle HTTP adapter
│   ├── lib/contract-presentation.ts        # Status tones, allowed actions, event/overview rows
│   ├── lib/contract-translations.ts        # Lifecycle, list and detail copy (VI/EN)
│   ├── hooks/use-contracts.ts              # Contract list/detail queries
│   ├── hooks/use-contract-mutation.ts      # Lifecycle mutation with cache invalidation
│   ├── hooks/use-contract-list-page.ts     # URL-backed search/status filters
│   ├── hooks/use-contract-detail-page.ts   # Detail query, dialog state and mutations
│   ├── hooks/use-lifecycle-form.ts         # Controlled lifecycle form submission
│   ├── hooks/use-swap-candidates.ts        # Same-type available/reserved replacement query
│   ├── components/list/ContractPageHeader.tsx   # Title and create action
│   ├── components/list/ContractFilterBar.tsx    # Search and status controls
│   ├── components/list/ContractStatusBadge.tsx  # Localized status badge
│   ├── components/list/ContractList.tsx         # Desktop table / mobile card switch
│   ├── components/list/ContractCard.tsx         # One mobile contract record
│   ├── components/list/ContractTable.tsx        # Desktop contract table
│   ├── components/list/ContractTableRow.tsx     # One desktop contract row
│   ├── components/detail/ContractDetailHeader.tsx # Back link, code, status, PDF
│   ├── components/detail/ContractActions.tsx    # Status-driven action group
│   ├── components/detail/ContractOverview.tsx   # Total, handover and lifecycle stamps
│   ├── components/detail/ContractLineList.tsx   # Vehicle lines incl. replaced history
│   ├── components/detail/ContractLineItem.tsx   # One vehicle line with swap links
│   ├── components/detail/ContractLineNotes.tsx  # Explanation and override notes
│   ├── components/detail/ContractTimeline.tsx   # Newest-first event history
│   ├── components/detail/TimelineEvent.tsx      # One event with actor and description
│   ├── components/lifecycle/LifecycleDialogs.tsx     # Renders the open lifecycle dialog
│   ├── components/lifecycle/LifecycleDialogShell.tsx # Accessible dialog frame with autofocus
│   ├── components/lifecycle/LifecycleFormDialog.tsx  # Form dialog with error alert and actions
│   ├── components/lifecycle/MutationAlert.tsx        # role=alert mutation error
│   ├── components/lifecycle/ConfirmActionDialog.tsx  # Handover and return confirmation
│   ├── components/lifecycle/CancelContractDialog.tsx # Required-reason destructive cancel
│   ├── components/lifecycle/ExtendContractDialog.tsx # Extension submission
│   ├── components/lifecycle/ExtendContractFields.tsx # Current end, new end and reason fields
│   ├── components/lifecycle/SwapVehicleDialog.tsx    # Swap submission
│   ├── components/lifecycle/SwapVehicleFields.tsx    # Line, replacement and reason fields
│   ├── components/success/ContractSuccess.tsx        # Creation success summary
│   ├── components/success/ContractSuccessActions.tsx # PDF, view detail and create another
│   ├── pages/ContractListPage.tsx          # List route composition
│   ├── pages/ContractDetailPage.tsx        # Detail route composition
│   ├── pages/ContractWizardPage.tsx        # Creation route (eyebrow copy)
│   └── index.ts                            # Public feature exports
└── features/dashboard/
    ├── api/operations-board-api.ts         # Runtime-validated board adapter
    ├── lib/board-presentation.ts           # Schedule filters, tones, shares and detail text
    ├── hooks/use-dashboard.ts              # Board query with periodic refresh
    ├── hooks/use-schedule-filter.ts        # Pickup/return filter state
    ├── components/DashboardHeader.tsx      # Business date and create action
    ├── components/KpiGrid.tsx              # Four KPI cards with contextual hints
    ├── components/PriorityWorkList.tsx     # Overdue-first work list
    ├── components/PriorityItem.tsx         # One linked priority row
    ├── components/TodaySchedule.tsx        # Filtered schedule section
    ├── components/ScheduleFilter.tsx       # Pressed-state filter buttons
    ├── components/ScheduleItem.tsx         # One schedule row in business time
    ├── components/FleetStatus.tsx          # Fleet share progress and summary
    └── pages/OperationsDashboard.tsx       # Dashboard route composition
```

## Tests

```text
app/
├── vitest.config.ts                        # Admin @ alias for presentation unit tests
├── tests/domain/support/contract-fixture.ts     # Anonymized contract/line/vehicle fixtures
├── tests/domain/contract-lifecycle.test.ts      # Transition matrix, boundaries, board policy
├── tests/api/support/lifecycle-client.ts        # Authenticated CSRF-aware API client
├── tests/api/contract-lifecycle.test.ts         # Lifecycle, extension, swap, list, board, auth
├── tests/infrastructure/prisma-sprint4.repositories.test.ts # Prisma lifecycle/extend/swap adapters
├── tests/infrastructure/prisma-sprint3.repositories.test.ts # Updated for new columns/events
├── tests/admin/contract-presentation.test.ts    # Presentation helpers and business-time formatting
├── e2e/support/contracts.ts                     # Browser-session contract seeding helper
├── e2e/contract-lifecycle.spec.ts               # List, handover/return, cancel, extend, swap, dashboard
├── e2e/contract-creation.spec.ts                # Wizard moved to /contracts/new
├── e2e/responsive-preview.spec.ts               # Board endpoint and business-date expectations
└── e2e/workspace-navigation.spec.ts             # Contract list and wizard routes
```

## Dependency rules

- HTTP controllers depend on services and shared Zod contracts only.
- Lifecycle, extension, swap and board services depend on repository ports, pure policies,
  the vehicle synchronization service and the audit service.
- Only Prisma adapters import Prisma; the scheduler depends on the lifecycle service only.
- Demo seeds and repositories contain synthetic fixtures only and never enter production.
- Frontend server state stays in TanStack Query; dialogs keep only form state.
- All files remain below 300 lines and all functions below the effective 30-line lint limit.

## Data invariants

- Allowed transitions: CONFIRMED→ACTIVE, CONFIRMED→CANCELLED, ACTIVE→OVERDUE (scheduled only),
  ACTIVE/OVERDUE→COMPLETED. Everything else returns 409 `INVALID_TRANSITION`.
- Overdue is decided by `now >= endAt`; the 60-minute grace only affects the late fee.
- Cancelled and completed lines stop blocking availability; the partial exclusion constraint
  remains the last line of defence for open lines.
- Extension keeps the original start, moves the end later, reprices every active line by the
  final tier of its snapshot version and records before/after totals in the event.
- A swap truncates the old line at the swap moment, creates a linked replacement that inherits
  the remaining period and price, and never changes the contract total.
- Vehicle status is derived from open holds after each transition: RENTED for ACTIVE/OVERDUE
  lines, RESERVED for CONFIRMED lines, otherwise AVAILABLE unless manually blocked.
