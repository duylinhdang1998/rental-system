# Sprint 8 Exact File Blueprint — Frontend Architecture Remediation

**Status:** APPROVED — client remediation criteria dated 2026-09-01
**Architecture:** Preserve the React SPA/NestJS modular monolith while replacing the
frontend primitive layer and reorganizing feature internals by responsibility.

```text
app/apps/admin/
├── components.json                         # shadcn radix-nova registry configuration
├── package.json                            # shadcn/Radix/CVA/Tailwind merge dependencies
├── tsconfig.json                           # @ alias for registry and feature imports
├── vite.config.ts                          # matching @ source alias
└── src/
    ├── components/ui/                      # CLI-managed shadcn/Radix primitives only
    ├── lib/utils.ts                        # shadcn class merge helper
    ├── shared/ui/SelectField.tsx           # Radix Select + shadcn Field composition
    ├── shared/ui/CheckboxField.tsx         # Radix Checkbox + shadcn Field composition
    ├── shared/ui/TextAreaField.tsx         # shadcn Textarea + Field composition
    ├── styles.css                          # Inter + approved Soft Modern semantic tokens
    ├── features/auth/
    │   ├── api/auth-api.ts                 # Session/login HTTP boundary
    │   ├── components/                     # Login/session presentation
    │   ├── hooks/                          # Session and login state hooks
    │   ├── pages/LoginPage.tsx             # Login route composition
    │   └── index.ts                        # Public feature exports
    ├── features/dashboard/
    │   ├── components/                     # Dashboard presentation sections
    │   ├── hooks/use-dashboard.ts           # Dashboard query boundary
    │   ├── pages/OperationsDashboard.tsx   # Dashboard route composition
    │   └── index.ts                        # Public feature exports
    ├── features/fleet/
    │   ├── api/fleet-api.ts                # Runtime-validated fleet HTTP adapter
    │   ├── components/calendar/            # Availability overlay, toolbar and grid
    │   ├── components/filters/             # Fleet search/status/type controls
    │   ├── components/form/                # Vehicle dialog and fields
    │   ├── components/list/                # Responsive vehicle table/cards/header
    │   ├── hooks/                          # Fleet, page, calendar and form state
    │   ├── lib/vehicle-status.ts           # Vehicle status presentation policy
    │   ├── pages/VehicleListPage.tsx       # Fleet route composition
    │   └── index.ts                        # Public feature exports
    ├── features/customers/
    │   ├── api/customers-api.ts            # Runtime-validated customer HTTP adapter
    │   ├── components/form/                # Customer dialog, fields and duplicate notice
    │   ├── components/list/                # Responsive customer list/card/header/search
    │   ├── hooks/                          # Customer query, form and page state
    │   ├── pages/CustomerListPage.tsx      # Customer route composition
    │   └── index.ts                        # Public feature exports
    ├── features/contracts/
    │   ├── api/contracts-api.ts            # Contract HTTP boundary
    │   ├── components/
    │   │   ├── customer/                   # Customer selection and risk acknowledgement
    │   │   ├── vehicle/                    # Vehicle selection controls
    │   │   ├── pricing/                    # Quote, override and confirmation controls
    │   │   ├── handover/                   # Rental dates and handover inputs
    │   │   ├── layout/                     # Progress, summary and wizard actions
    │   │   ├── success/                    # Completion state and PDF action
    │   │   └── ContractWizardContent.tsx   # Step orchestration only
    │   ├── hooks/use-contract-wizard.ts    # Wizard state and mutations
    │   ├── lib/                            # Draft and translation policies
    │   ├── pages/ContractWizardPage.tsx    # Contract route composition
    │   └── index.ts                        # Public feature exports
    └── features/settings/
        ├── api/settings-api.ts             # Pricing settings HTTP boundary
        ├── components/                     # Settings presentation and shadcn fields
        ├── hooks/                          # Pricing query and late-return form state
        ├── pages/SettingsPage.tsx          # Owner settings route composition
        └── index.ts                        # Public feature exports

app/packages/contracts/src/
├── fleet.ts                                # Vehicle output includes createdAt
└── customers.ts                            # Customer/contact output includes createdAt

app/apps/api/prisma/
├── schema.prisma                           # createdAt on every persisted business record
└── migrations/202609010004_created_at_consistency/migration.sql
                                                # Safe defaults for missing timestamps

app/tests/admin/frontend-architecture.test.ts # Static stack/structure/native-control gate
app/e2e/frontend-remediation.spec.ts          # Dialog, calendar, Inter, mobile and CreatedAt BAT
```

## Dependency rules

- Feature modules may import `components/ui`, shared API/i18n/layout utilities and their own
  feature internals; they do not import another feature's private folders.
- Only `components/ui` may contain native form-control tags because those files are the
  audited shadcn primitive implementation.
- Route components compose feature hooks and presentation components; reusable state/query
  logic lives under each feature's `hooks/` folder.
- `createdAt` is generated by persistence/demo repositories, validated at the shared contract
  boundary and formatted only at the presentation boundary.
