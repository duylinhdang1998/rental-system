# Sprint 1 Reusable Components

## Shared inventory

| Component | Key variants/states | Accessibility/behavior |
|---|---|---|
| `AppShell` | desktop, tablet drawer, mobile bottom nav | landmarks, skip link, focus restoration |
| `PageHeader` | title, description, breadcrumbs, action | h1 exactly once per page |
| `DemoBanner` | persistent warning | icon + text; not dismissible |
| `Button` | primary, secondary, quiet, danger; idle/loading/disabled | 44 px default target; busy label |
| `TextField` | default, password, search, error, disabled | visible label, description/error IDs |
| `Select/Popover/Dialog/Tooltip` | Radix-backed | keyboard/focus management |
| `KpiCard` | neutral, success, warning, danger | label/value/context; optional link |
| `StatusBadge` | available, rented, reserved, due, overdue, maintenance | color + icon + text |
| `DataTable` | loading, populated, empty, error, paginated | semantic table; caption; sortable labels |
| `MobileEntityCard` | compact, actionable, alert | same data priority as desktop row |
| `FilterBar` | desktop inline, mobile bottom sheet | search stays visible; filters summarized |
| `ViewState` | skeleton, empty, error, denied | meaningful next action |
| `Toast` | success/info | transient only, polite live region |

## Component anatomy

```text
KPI CARD
┌──────────────────────────────┐
│ [icon] Label            [?]  │
│ 12                           │
│ +2 so với hôm qua            │
└──────────────────────────────┘

MOBILE ENTITY CARD
┌──────────────────────────────┐
│ 43A1-123.45   [Đang thuê]    │
│ Honda Vision · Đỏ            │
│ Khách: Nguyễn An             │
│ Trả: 17:30 hôm nay           │
│ [Xem chi tiết]        [•••]  │
└──────────────────────────────┘
```

## Rules

- Components consume only approved tokens from `.project/design-system.md`.
- One component per source file; visual variants are typed.
- Server state belongs to TanStack Query; table/filter state belongs to URL/local feature state.
- No feature creates its own button, badge, dialog or view-state pattern.
- Mobile conversions preserve content and action priority rather than merely hiding columns.
