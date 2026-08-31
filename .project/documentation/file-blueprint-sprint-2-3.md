# Sprint 2–3 Exact File Blueprint

**Status:** DRAFT — awaiting BDD/wireframe approval  
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
├── fleet-api.ts                            # Validated fleet HTTP adapter
├── use-fleet.ts                            # Fleet query/mutations
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
