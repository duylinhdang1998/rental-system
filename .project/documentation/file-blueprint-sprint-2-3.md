# Sprint 2–3 Exact File Blueprint

**Status:** APPROVED — Sprint 2–3 implementations reconciled
**Architecture:** Extend the approved modular NestJS + React SPA monolith; no new service boundary.

```text
app/packages/contracts/src/
├── catalog.ts                              # Vehicle type, tag and document-type schemas
├── fleet.ts                                # Vehicle CRUD/filter/status contracts
├── customers.ts                            # Customer/contact/tag/document contracts
├── pricing.ts                              # Versioned tiers, quote and override contracts
├── contracts.ts                            # Availability, handover and contract contracts
└── index.ts                                # Public contract exports

app/apps/api/src/common/
├── audit/audit.service.ts                  # Append-only redacted audit events
├── audit/audit.types.ts                    # Stable audit event shapes
└── storage/private-file.service.ts         # Private metadata and short-lived access descriptors

app/apps/api/src/modules/fleet/
├── fleet.module.ts                         # Fleet dependencies and repository selection
├── fleet.controller.ts                     # Authenticated vehicle/catalog HTTP boundary
├── fleet.service.ts                        # Vehicle/catalog use cases and conflicts
├── vehicle-transition.policy.ts            # Pure controlled status state machine
├── fleet.repository.ts                     # Fleet repository facade
├── fleet.types.ts                          # Internal vehicle/catalog records
├── demo-fleet.repository.ts                # Synthetic in-memory development adapter
└── prisma-fleet.repository.ts              # PostgreSQL fleet persistence adapter

app/apps/api/src/modules/customers/
├── customers.module.ts                     # Customer dependencies and repository selection
├── customers.controller.ts                 # Authenticated customer/document HTTP boundary
├── customers.service.ts                    # CRUD, duplicate and blacklist use cases
├── contact-normalizer.ts                   # Pure phone/email normalization
├── customers.repository.ts                 # Customer repository facade
├── customers.types.ts                      # Internal customer/document records
├── demo-customers.repository.ts            # Synthetic in-memory development adapter
└── prisma-customers.repository.ts           # PostgreSQL customer persistence adapter

app/apps/api/src/modules/pricing/
├── pricing.module.ts                       # Pricing dependencies
├── pricing.controller.ts                   # Owner configuration and quote boundary
├── pricing.service.ts                      # Version publishing and quote orchestration
├── pricing.policy.ts                       # Pure 24h/grace/tier/adjustment calculation
├── pricing.repository.ts                   # Versioned pricing repository facade
├── pricing.types.ts                        # Internal price version/snapshot records
├── demo-pricing.repository.ts              # Synthetic versioned development adapter
└── prisma-pricing.repository.ts            # PostgreSQL pricing persistence adapter

app/apps/api/src/modules/contracts/
├── contracts.module.ts                     # Contract dependencies
├── contracts.controller.ts                 # Availability/create/PDF HTTP boundary
├── contracts.service.ts                    # Quote confirmation and atomic creation use cases
├── availability.policy.ts                  # Pure half-open interval overlap policy
├── contract-code.service.ts                # Unique human-readable code generation
├── contract-pdf.service.ts                 # Bilingual PDF from immutable snapshot
├── contracts.repository.ts                 # Atomic repository facade
├── contracts.types.ts                      # Internal contract/handover/snapshot records
├── demo-contracts.repository.ts            # Deterministic serialized development adapter
└── prisma-contracts.repository.ts          # PostgreSQL transaction adapter

app/apps/api/prisma/
├── schema.prisma                           # Fleet/customer/pricing/contract data model
└── migrations/202609010002_sprint_2_3/
    └── migration.sql                       # Constraints, indexes and overlap exclusion

app/apps/admin/src/features/fleet/
├── VehicleListPage.tsx                     # Fleet server-state and URL-filter composition
├── VehicleList.tsx                         # Desktop table/mobile card switch
├── VehicleCard.tsx                         # One mobile fleet record
├── VehicleForm.tsx                         # Validated add/edit form
├── VehicleStatusDialog.tsx                 # Reasoned status transition UI
├── AvailabilityCalendar.tsx                # Room-booking style vehicle/day grid
├── AvailabilityDay.tsx                     # Accessible one-vehicle/day state cell
├── fleet-api.ts                            # Validated fleet HTTP adapter
├── use-fleet.ts                            # Fleet query/mutations
├── use-fleet-calendar.ts                   # Date-range availability query/URL state
└── index.ts                                # Fleet public exports

app/apps/admin/src/features/customers/
├── CustomerListPage.tsx                    # Customer server-state/filter composition
├── CustomerList.tsx                        # Desktop table/mobile card switch
├── CustomerCard.tsx                        # One masked customer card
├── CustomerForm.tsx                        # Customer/contact/private-document form
├── DuplicateCustomerNotice.tsx             # Existing-record recovery action
├── BlacklistWarning.tsx                    # Explicit warning acknowledgement
├── customers-api.ts                        # Validated customer HTTP adapter
├── use-customers.ts                        # Customer query/mutations
└── index.ts                                # Customer public exports

app/apps/admin/src/features/contracts/
├── ContractWizardPage.tsx                  # Persisted five-step flow composition
├── ContractProgress.tsx                    # Accessible step indicator
├── CustomerStep.tsx                        # Existing/quick-create customer selection
├── VehicleStep.tsx                         # Interval and multi-vehicle availability
├── PricingStep.tsx                         # Tier explanation and override reason
├── HandoverStep.tsx                        # Deposit/document/fuel/private images
├── ConfirmationStep.tsx                    # Snapshot review and atomic submit
├── ConflictNotice.tsx                      # Conflict explanation and recovery
├── ContractSuccess.tsx                     # Detail/PDF follow-up actions
├── contract-api.ts                         # Validated contract HTTP adapter
├── contract-draft.ts                       # Reducer and persisted draft contract
├── use-contract-wizard.ts                  # Step validation and server mutations
└── index.ts                                # Contract public exports

app/apps/admin/src/shared/ui/
├── Dialog.tsx                              # Accessible controlled dialog primitive
├── FilterBar.tsx                           # URL-backed search/filter controls
├── StatusBadge.tsx                         # Icon + text operational status
└── FormErrorSummary.tsx                    # Focusable validation summary

app/tests/
├── api/fleet-customers.test.ts             # Sprint 2 API/security scenarios
├── domain/fleet-customer-policy.test.ts     # Normalization/state-machine unit scenarios
├── api/pricing-contracts.test.ts            # Sprint 3 transaction/PDF scenarios
└── domain/pricing-availability.test.ts      # Golden pricing/overlap unit scenarios

app/e2e/
├── fleet-customer-management.spec.ts       # Sprint 2 desktop/mobile journey
└── contract-creation.spec.ts               # Sprint 3 mobile/desktop wizard journey
```

## Dependency rules

## Sprint 3 implementation reconciliation (authoritative)

Sprint 3 follows the planned module boundaries. Repository facade names use singular
`contract.*` files and injection tokens, while the React flow is split into focused
one-component files to satisfy the enforced review gates. A shared reservation registry keeps
demo calendar and contract state consistent; production calendar rows query contract lines.

```text
app/apps/api/src/common/reservations/
├── reservation.module.ts                   # One shared demo reservation scope per app
└── reservation-registry.ts                 # Half-open demo calendar/contract reservations

app/apps/api/src/modules/pricing/
├── pricing.module.ts                       # Environment-aware pricing composition
├── pricing.controller.ts                   # Current/publish/quote endpoints
├── pricing.service.ts                      # Versioned quote and override audit orchestration
├── pricing.policy.ts                       # Pure day/tier/adjustment rules
├── pricing.tokens.ts                       # Pricing repository token
├── pricing.types.ts                        # Pricing port and snapshot inputs
├── demo-pricing.repository.ts              # Synthetic versioned prices/customers/vehicles
└── prisma-pricing.repository.ts            # PostgreSQL pricing adapter

app/apps/api/src/modules/contracts/
├── contract.module.ts                      # Environment-aware contract composition
├── contract.controller.ts                  # Availability/create/read/PDF endpoints
├── contract.service.ts                     # Atomic confirmation/private access use cases
├── availability.policy.ts                  # Pure half-open overlap rule
├── contract-code.service.ts                # Unique human-readable code function
├── contract-pdf.service.ts                 # PDF from immutable customer/price snapshot
├── contract.tokens.ts                      # Contract repository token
├── contract.types.ts                       # Contract transaction port
├── demo-contract.repository.ts             # Serialized in-memory atomic adapter
└── prisma-contract.repository.ts           # Serializable PostgreSQL transaction adapter

app/apps/api/prisma/migrations/202609010002_pricing_contracts/migration.sql
                                                # Pricing/contracts/indexes/GiST exclusion
app/apps/api/prisma/migrations/202609010003_configurable_late_return_fee/migration.sql
                                                # Versioned late-return settings and snapshots

app/apps/admin/src/features/contracts/           # Five-step wizard and focused field components
app/tests/api/pricing-contracts.test.ts           # API, security, PDF and concurrency scenarios
app/tests/domain/pricing-availability.test.ts     # Golden pricing/overlap policy examples
app/tests/infrastructure/prisma-sprint3.repositories.test.ts
                                                # Production adapter verification
app/e2e/contract-creation.spec.ts                 # Desktop/mobile/conflict recovery journeys
```

## Sprint 3 late-return policy follow-up (authoritative)

```text
app/packages/contracts/src/
├── pricing.ts                              # Shared default/policy schemas and quote-line snapshot
└── contracts.ts                            # Per-vehicle late-return fee request/result schemas

app/apps/api/src/modules/pricing/
├── pricing.policy.ts                       # Strict 24h blocks and pure started-hour late fee
├── pricing.service.ts                      # Policy snapshot on every quoted vehicle line
├── demo-pricing.repository.ts              # Shared-default demo pricing adapter
└── prisma-pricing.repository.ts            # Versioned policy persistence mapping

app/apps/api/src/modules/contracts/
├── contract.controller.ts                  # Authenticated/CSRF late-fee calculation boundary
├── contract.service.ts                     # Calculate from the selected contract-line snapshot
├── prisma-contract.repository.ts           # Persist/map immutable per-line late policy
└── contract-pdf.service.ts                 # Print snapshotted late-return terms

app/apps/admin/src/features/settings/
├── SettingsPage.tsx                        # Owner settings route composition
├── SettingsHeader.tsx                      # Settings title and operational context
├── PricingSettingsState.tsx                # Loading/error state with retry
├── LateReturnSettingsForm.tsx              # Policy form composition and live example
├── LateReturnFields.tsx                    # Accessible minutes/rate controls
├── LateReturnSaveStatus.tsx                # Inline save success/error feedback
├── settings-api.ts                         # Runtime-validated current/publish adapter
├── use-late-return-form.ts                 # Controlled policy form state and submit
├── use-pricing-settings.ts                 # Pricing query/mutation invalidation
└── index.ts                                # Public SettingsPage export

app/tests/api/late-return-pricing.test.ts    # RBAC and immutable contract fee calculation
app/e2e/workspace-navigation.spec.ts         # Owner configuration browser acceptance
```

## Sprint 2 implementation reconciliation (authoritative)

The approved implementation splits presentation files further to satisfy the enforced
one-component-per-file and 30-line function gates. These paths supersede differing Sprint 2
names in the earlier planning tree; reserved Sprint 3 paths remain unchanged.

```text
app/apps/api/src/common/
├── audit/audit.module.ts                    # Environment-aware audit composition
├── audit/audit.service.ts                   # Application-facing append-only audit port
├── audit/audit.tokens.ts                    # Audit repository injection token
├── audit/audit.types.ts                     # Audit event and repository contracts
├── audit/demo-audit.repository.ts           # Synthetic in-memory audit adapter
├── audit/prisma-audit.repository.ts         # Persistent PostgreSQL audit adapter
└── errors/domain.error.ts                   # Typed domain errors normalized by one filter

app/packages/contracts/src/time.ts            # Shared ISO date/day constants for API and SPA

app/apps/api/src/modules/fleet/
├── fleet.module.ts                          # Fleet adapter composition
├── fleet.controller.ts                      # Authenticated fleet HTTP boundary
├── fleet.service.ts                         # Fleet/catalog/calendar use cases
├── fleet.tokens.ts                          # Fleet repository injection token
├── fleet.types.ts                           # Fleet repository/query contracts
├── demo-fleet.repository.ts                 # Synthetic fleet/calendar/history adapter
├── prisma-fleet.repository.ts               # PostgreSQL fleet/history adapter
├── plate-normalizer.ts                      # Pure plate canonicalization
└── vehicle-transition.policy.ts             # Pure manual transition policy

app/apps/api/src/modules/customers/
├── customer.module.ts                       # Customer adapter composition
├── customer.controller.ts                   # Authenticated customer HTTP boundary
├── customer.service.ts                      # Customer/duplicate/document use cases
├── customer.tokens.ts                       # Customer repository injection token
├── customer.types.ts                        # Customer repository/document contracts
├── demo-customer.repository.ts              # Synthetic customer/private-file metadata adapter
├── prisma-customer.repository.ts            # PostgreSQL customer adapter
├── contact-normalizer.ts                    # Pure phone/email normalization
└── private-file.service.ts                  # Redacted short-lived document access descriptor

app/apps/admin/src/features/fleet/
├── VehicleListPage.tsx                      # Fleet route composition and view states
├── VehicleList.tsx                          # Responsive list composition
├── VehicleCard.tsx                          # Mobile vehicle card
├── VehicleTable.tsx                         # Desktop vehicle table
├── VehicleTableRow.tsx                      # Desktop vehicle row
├── VehicleForm.tsx                          # Create-vehicle form composition
├── VehicleFields.tsx                        # Vehicle text fields
├── VehicleTypeField.tsx                     # Vehicle-type control
├── FleetPageHeader.tsx                      # Fleet title and primary actions
├── FleetFilterBar.tsx                       # URL-backed filter composition
├── FleetSearchField.tsx                     # Vehicle search control
├── FleetStatusFilter.tsx                    # Vehicle status filter
├── FleetTypeFilter.tsx                      # Vehicle type filter
├── AvailabilityCalendar.tsx                 # Calendar query-state composition
├── AvailabilityDay.tsx                      # Accessible availability cell
├── CalendarControls.tsx                     # Previous/next week controls
├── CalendarGrid.tsx                         # Scroll-contained calendar grid
├── CalendarHeaderRow.tsx                    # Calendar day headers
├── CalendarToolbar.tsx                      # Calendar title/range composition
├── CalendarVehicleRow.tsx                   # One vehicle calendar row
├── fleet-api.ts                             # Runtime-validated fleet HTTP adapter
├── use-fleet.ts                             # Fleet query/mutation hooks
├── use-fleet-calendar.ts                    # Calendar date/query hook
├── use-fleet-page.ts                        # URL/local route state hook
├── use-vehicle-form.ts                      # Controlled vehicle form hook
├── vehicle-status.ts                        # Single status-to-tone policy
└── index.ts                                 # Fleet public export

app/apps/admin/src/features/customers/
├── CustomerListPage.tsx                     # Customer route composition and view states
├── CustomerList.tsx                         # Responsive customer collection
├── CustomerCard.tsx                         # Customer summary card
├── CustomerContacts.tsx                     # Contact channel list
├── CustomerForm.tsx                         # Create-customer form composition
├── CustomerFields.tsx                       # Customer contact/profile controls
├── CustomerPageHeader.tsx                   # Customer title and primary action
├── CustomerSearch.tsx                       # URL-backed customer search
├── DuplicateCustomerNotice.tsx              # Existing-record recovery action
├── BlacklistWarning.tsx                     # Explicit risk acknowledgement
├── customers-api.ts                         # Runtime-validated customer HTTP adapter
├── use-customers.ts                         # Customer query/mutation hooks
├── use-customer-form.ts                     # Controlled form and duplicate query hook
└── index.ts                                 # Customer public export

app/apps/admin/src/shared/
├── api/http.ts                              # Credential/CSRF/error fetch policy
├── ui/FormActions.tsx                       # Shared cancel/save action row
└── ui/StatusBadge.tsx                       # Icon-and-text semantic status primitive

app/apps/api/prisma/
├── schema.prisma                            # Fleet/customer/audit persistence model
└── migrations/202609010001_fleet_customers/migration.sql # Sprint 2 forward migration
```

- HTTP controllers depend on services and shared Zod contracts only.
- Services depend on repository facades, pure policies, audit and private-file services.
- Only Prisma adapters import Prisma; only PDF service imports the PDF library.
- Demo repositories contain synthetic fixtures only and are never mounted in production.
- Frontend server state stays in TanStack Query; the local contract draft contains form state only.
- All new files remain below 300 lines and all functions below the effective 30-line lint limit.

## Data invariants

- Vehicle plate and code are normalized/unique; RENTED/RESERVED status derives from active contract lines.
- Customer contacts are normalized and indexed; private file keys never enter list contracts.
- Pricing versions and confirmed contract snapshots are immutable.
- Rental intervals are half-open `[startAt, endAt)` in `TIMESTAMPTZ`.
- PostgreSQL prevents overlapping active contract lines per vehicle; confirmation rechecks all vehicles in one transaction.
