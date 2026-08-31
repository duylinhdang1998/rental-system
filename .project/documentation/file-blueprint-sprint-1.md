# Sprint 1 Exact File Blueprint

**Status:** APPROVED RECONCILIATION — 2026-09-01  
**Decision:** Sprint 1 uses the shared Zod contract package directly. Orval generation, data-table primitives, advanced filters, dialogs and toasts begin only when a later sprint has the corresponding workflow.

```text
app/apps/admin/src/
├── main.tsx                                  # Browser bootstrap and global imports
├── App.tsx                                   # Providers and role-aware route tree
├── styles.css                                # Approved design tokens and global CSS
├── routes/
│   ├── AuthenticatedRoute.tsx                # Session-required route boundary
│   ├── LoginRoute.tsx                        # Login/active-session route switch
│   └── OwnerRoute.tsx                        # Owner-only client route boundary
├── features/auth/
│   ├── LoginForm.tsx                         # Credential form behavior
│   ├── LoginFields.tsx                       # Labelled credential inputs
│   ├── LoginHero.tsx                         # Desktop login value proposition
│   ├── LoginPage.tsx                         # Responsive login composition
│   ├── SessionProvider.tsx                   # Session restore/login state provider
│   ├── auth-api.ts                           # Auth HTTP adapter
│   ├── session-context.ts                    # Session context contract
│   ├── use-login-form.ts                     # Login submission state and navigation
│   ├── use-session.ts                        # Session context hook
│   └── index.ts                              # Auth public exports
├── features/dashboard/
│   ├── OperationsDashboard.tsx               # Dashboard state and section composition
│   ├── DashboardHeader.tsx                   # Localized date and primary future action
│   ├── FleetStatus.tsx                       # Accessible fleet summary and bar
│   ├── KpiGrid.tsx                           # API-driven KPI collection
│   ├── PriorityItem.tsx                      # One labelled priority card
│   ├── PriorityWorkList.tsx                  # Ordered urgent-work preview
│   ├── ScheduleItem.tsx                      # One responsive schedule card
│   ├── TodaySchedule.tsx                     # Responsive schedule cards
│   ├── use-dashboard.ts                      # Dashboard server-state query
│   └── index.ts                              # Dashboard public export
├── features/fleet/VehiclePreview.tsx         # Vehicle module preview
├── features/fleet/index.ts                   # Fleet public export
├── features/customers/CustomerPreview.tsx    # Customer module preview
├── features/customers/index.ts               # Customer public export
├── features/contracts/ContractPreview.tsx    # Contract module preview
├── features/contracts/index.ts               # Contract public export
├── features/returns/ReturnQueuePreview.tsx   # Return module preview
├── features/returns/index.ts                 # Return public export
├── features/reporting/ReportPreview.tsx      # Owner report preview
├── features/reporting/index.ts               # Reporting public export
├── features/employees/EmployeePreview.tsx    # Owner employee preview
├── features/employees/index.ts               # Employee public export
├── features/settings/SettingsPreview.tsx     # Owner settings preview
├── features/settings/index.ts                # Settings public export
└── shared/
    ├── api/demo-api.ts                       # Validated demo HTTP adapter
    ├── i18n/i18n.ts                          # VI/EN dictionaries and initialization
    ├── i18n/locale.ts                        # Locale resolution, date and currency formatting
    ├── layout/AppHeader.tsx                  # Responsive global header
    ├── layout/AppShell.tsx                   # Stable application shell
    ├── layout/DemoBanner.tsx                 # Persistent demo-data disclosure
    ├── layout/DesktopNavigation.tsx          # Desktop role navigation
    ├── layout/LocaleToggle.tsx               # Persistent language control
    ├── layout/MobileNavigation.tsx           # 44px mobile navigation targets
    ├── navigation/routes.ts                  # Shared role-aware route model
    ├── pages/AccessDeniedPage.tsx            # Forbidden route state
    ├── pages/PreviewPage.tsx                 # Shared API-backed preview composition
    ├── pages/use-preview.ts                   # Preview server-state query
    ├── query/QueryProvider.tsx                # TanStack Query client boundary
    ├── ui/Button.tsx                         # Accessible primary button
    ├── ui/KpiCard.tsx                        # One operational KPI
    ├── ui/LoadingScreen.tsx                   # Session bootstrap state
    ├── ui/TextField.tsx                      # Labelled form control
    └── ui/ViewState.tsx                      # Loading, empty and error contract

app/apps/api/src/
├── bootstrap.ts                              # Executable API startup
├── main.ts                                   # Nest app factory and HTTP hardening
├── app.module.ts                             # Root module composition
├── config/
│   ├── environment.ts                        # Single Zod environment schema
│   ├── env.schema.ts                         # Public environment contract export
│   └── configuration.ts                      # Process environment adapter
├── common/
│   ├── filters/api-exception.filter.ts       # Normalized safe HTTP errors
│   ├── guards/authentication.guard.ts        # Server-session authentication
│   ├── guards/authorization.guard.ts         # Owner role enforcement
│   ├── http/cookies.ts                       # Cookie header parsing
│   ├── http/request-context.ts               # Request ID and user shape
│   ├── interceptors/request-context.interceptor.ts # Correlation ID lifecycle
│   ├── pipes/api-validation.pipe.ts          # Nest whitelist baseline
│   ├── pipes/zod-validation.pipe.ts          # Shared Zod request boundary
│   └── time.ts                               # Shared time conversion constant
├── database/prisma.service.ts                # Prisma client lifecycle
├── modules/auth/
│   ├── auth.module.ts                        # Auth dependency composition
│   ├── auth.controller.ts                    # Thin auth HTTP adapter
│   ├── auth.service.ts                       # Login/session/CSRF use cases
│   ├── auth.errors.ts                        # Stable typed auth failures
│   ├── auth.repository.ts                    # Repository facade
│   ├── auth-cookie.service.ts                # Secure cookie policy
│   ├── auth-rate-limit.service.ts            # Account+client throttle policy
│   ├── auth-token.service.ts                 # Opaque token generation/hash
│   ├── auth.tokens.ts                        # Repository injection tokens
│   ├── auth.types.ts                         # Internal auth contracts
│   ├── csrf.guard.ts                         # Mutation CSRF enforcement
│   ├── demo-account.repository.ts            # Demo identity adapter
│   ├── memory-session.repository.ts          # Demo session adapter
│   ├── prisma-account.repository.ts          # Production identity persistence
│   ├── prisma-session.repository.ts          # Production session persistence
│   └── security-event.service.ts             # Redacted auth security events
├── modules/demo/
│   ├── demo.module.ts                        # Non-production preview composition
│   ├── demo-dashboard.controller.ts          # Authenticated dashboard endpoint
│   ├── demo-dashboard.service.ts             # Dashboard demo view model
│   ├── demo-preview.controller.ts            # Authenticated/RBAC module endpoints
│   └── demo-preview.service.ts               # Shared preview view model
└── modules/health/
    ├── health.module.ts                      # Health composition
    ├── health.controller.ts                  # Health HTTP adapter
    └── health.service.ts                     # Liveness response

app/packages/contracts/src/
├── auth.ts                                   # Shared auth schemas and role type
├── preview.ts                                # Shared preview schemas/sprint map
└── index.ts                                  # Contract package exports
```

Backend dependencies remain controller/guard → service → repository. Only Prisma repositories and `PrismaService` import Prisma. External JSON is parsed with shared Zod schemas before entering React state.
