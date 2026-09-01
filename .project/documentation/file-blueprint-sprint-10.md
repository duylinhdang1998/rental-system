# UI Foundation Review — Exact File Blueprint

**Status:** APPROVED — implementation in progress
**Architecture:** Development-only React showroom, isolated from business routes and data.

```text
app/apps/admin/src/
├── App.tsx                                      # Registers /ui-kit only in development
├── ../index.html                                # Declares the brand favicon
├── ../public/favicon.svg                        # Local brand favicon asset
├── styles.css                                   # Named typography token utilities
├── components/ui/dialog-trigger.tsx             # Radix dialog trigger wrapper
├── components/ui/checkbox.tsx                   # 44px pointer target via pseudo hit area
├── components/ui/radio-group-item.tsx           # 44px pointer target via pseudo hit area
├── components/ui/select-group.tsx               # Required Select item grouping wrapper
├── routes/BusinessProviders.tsx                  # Operational providers outside /ui-kit
├── shared/ui/LoadingButton.tsx                   # Width-stable loading treatment
├── shared/ui/SelectField.tsx                     # Groups existing Select options correctly
├── shared/ui/ViewState.tsx                       # Context-aware heading level
└── features/ui-kit/
    ├── index.ts                                 # Public showroom page export
    ├── pages/UiKitPage.tsx                      # Composes the review workspace
    ├── lib/ui-kit-sections.ts                   # One typed section catalog
    ├── components/UiKitHeader.tsx               # Purpose, draft badge and review guidance
    ├── components/UiKitNavigation.tsx           # Linkable component-category navigation
    ├── components/ComponentSection.tsx          # Shared specimen section frame
    ├── components/FoundationShowcase.tsx        # Color, type, spacing, radius and elevation
    ├── components/FoundationColors.tsx          # Semantic color specimens
    ├── components/FoundationTypography.tsx      # Inter scale and shape notes
    ├── components/ButtonShowcase.tsx            # Button variants, sizes and async states
    ├── components/ButtonVariants.tsx            # Action hierarchy specimens
    ├── components/ButtonStates.tsx               # Size, disabled and loading specimens
    ├── components/FieldShowcase.tsx              # Input, textarea and validation states
    ├── components/SelectionShowcase.tsx          # Select, checkbox and radio states
    ├── components/SelectSpecimen.tsx             # Grouped Radix Select specimen
    ├── components/CheckboxSpecimen.tsx           # Checkbox states
    ├── components/RadioSpecimen.tsx              # Radio states
    ├── components/DataDisplayShowcase.tsx        # Status badge, KPI and table specimens
    ├── components/StatusSpecimen.tsx             # Semantic status variants
    ├── components/KpiSpecimen.tsx                # KPI card variants
    ├── components/TableSpecimen.tsx              # Table and CreatedAt specimen
    ├── components/FeedbackShowcase.tsx           # Loading, empty and error specimens
    └── components/OverlayShowcase.tsx            # Dialog trigger, content and focus behavior

app/tests/admin/ui-component-showroom.test.ts     # Dev-only route and reuse architecture gate
app/tests/admin/ui-kit-production-build.test.ts   # Production bundle exclusion gate
app/e2e/ui-component-showroom.spec.ts             # Desktop/mobile visual and interaction BAT
```

## Dependency Rules

- Showroom specimens import actual `components/ui` and `shared/ui` exports via `@/`; they do
  not copy primitive markup or styling.
- The feature does not call the API, use rental data or appear in operational navigation.
- `UiKitPage` only composes sections; every showcase and structural component has one file.
- The route is guarded by `import.meta.env.DEV` and absent from the production route tree.
- Existing business screens are not restyled during this review phase.
