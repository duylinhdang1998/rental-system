# Design System — Soft Modern Operations

**Version:** 1.0
**Date:** 2026-08-31
**Status:** APPROVED — GATE 1
**Selected direction:** UI 3 — Soft Modern

## 1. Design intent

- Friendly, youthful and touch-friendly without looking like a toy.
- Operational information stays scannable: status, deadline, money and primary action appear before decoration.
- Pastel colors are used for surfaces; accessible darker colors are used for text, icons and status labels.
- Desktop favors compact tables; mobile converts rows to cards with 44 px minimum touch targets.

## 2. Brand and semantic colors

| Token                     | Hex       | Usage                                       |
| ------------------------- | --------- | ------------------------------------------- |
| `--color-bg`              | `#FCFBFF` | App background                              |
| `--color-surface`         | `#FFFFFF` | Main cards, menus and dialogs               |
| `--color-surface-subtle`  | `#F7F5FC` | Secondary panels and table headers          |
| `--color-primary`         | `#6D5DD3` | Primary action, active navigation           |
| `--color-primary-hover`   | `#5C4BC3` | Primary hover                               |
| `--color-primary-pressed` | `#4D3DAE` | Primary pressed                             |
| `--color-primary-soft`    | `#EEEAFE` | Selected and emphasized background          |
| `--color-accent`          | `#D85C8A` | Limited brand accent, not generic action    |
| `--color-accent-soft`     | `#FCEAF1` | Accent surface                              |
| `--color-text`            | `#292733` | Primary text                                |
| `--color-text-muted`      | `#676371` | Secondary text                              |
| `--color-text-subtle`     | `#817D8B` | Metadata; never essential information alone |
| `--color-border`          | `#E4E0EB` | Default border                              |
| `--color-border-strong`   | `#C9C3D4` | Inputs and strong separators                |
| `--color-focus`           | `#4937B7` | Keyboard focus ring                         |
| `--color-success`         | `#167A59` | Available, completed and positive values    |
| `--color-success-soft`    | `#E5F6EF` | Success badge/card background               |
| `--color-info`            | `#2468B4` | In progress and informational state         |
| `--color-info-soft`       | `#E7F1FC` | Info badge/card background                  |
| `--color-warning`         | `#9A5B08` | Due soon, attention required                |
| `--color-warning-soft`    | `#FFF2D8` | Warning badge/card background               |
| `--color-danger`          | `#B52E3A` | Overdue, destructive and failed states      |
| `--color-danger-soft`     | `#FDE9EB` | Danger badge/card background                |
| `--color-disabled`        | `#EEEAF2` | Disabled control background                 |
| `--color-on-disabled`     | `#8B8692` | Disabled text                               |

## 3. Status mapping

| Business state                                                                                                            | Background     | Foreground | Icon/text                 |
| ------------------------------------------------------------------------------------------------------------------------- | -------------- | ---------- | ------------------------- |
| Sẵn sàng / Hoàn tất                                                                                                       | success-soft   | success    | Check circle + label      |
| Đang thuê / Đang xử lý                                                                                                    | info-soft      | info       | Clock/route + label       |
| Đặt trước                                                                                                                 | primary-soft   | primary    | Calendar + label          |
| Sắp đến hạn                                                                                                               | warning-soft   | warning    | Alert triangle + label    |
| Quá hạn / Khóa / Lỗi                                                                                                      | danger-soft    | danger     | Alert circle/lock + label |
| Bảo trì / Không hoạt động                                                                                                 | surface-subtle | text-muted | Tool/pause + label        |
| Status is never communicated by color alone. Every status includes readable text and, where compact, a recognizable icon. |

## 4. Typography

| Token     | Size/line | Weight | Usage                      |
| --------- | --------- | ------ | -------------------------- |
| `display` | 32/40 px  | 700    | Login/product welcome only |
| `h1`      | 28/36 px  | 700    | Desktop page title         |
| `h2`      | 22/30 px  | 700    | Section title              |
| `h3`      | 18/26 px  | 650    | Card title                 |
| `body-lg` | 16/24 px  | 500    | Important body and actions |
| `body`    | 14/22 px  | 450    | Default UI text            |
| `label`   | 13/18 px  | 650    | Field and compact label    |
| `caption` | 12/18 px  | 500    | Metadata and hints         |

- Font family: `Inter, ui-sans-serif, system-ui, sans-serif` (client override approved 2026-09-01).
- Financial values and counts use `font-variant-numeric: tabular-nums`.
- Mobile page title uses 24/32 px; content never goes below 12 px.
- Vietnamese diacritics must be tested at all weights actually loaded.

## 5. Spacing and sizing

| Token      | Value | Typical use                     |
| ---------- | ----: | ------------------------------- |
| `space-1`  |  4 px | Icon/text micro gap             |
| `space-2`  |  8 px | Inline and compact vertical gap |
| `space-3`  | 12 px | Field internal gap              |
| `space-4`  | 16 px | Mobile card padding             |
| `space-5`  | 20 px | Standard section gap            |
| `space-6`  | 24 px | Desktop card padding            |
| `space-8`  | 32 px | Major section gap               |
| `space-10` | 40 px | Large layout gap                |
| `space-12` | 48 px | Page rhythm                     |
| `space-16` | 64 px | Login/marketing separation      |

- Minimum interactive target: 44 × 44 px.
- Standard input/button height: 44 px; compact table control: 36 px desktop only.
- Desktop sidebar: 248 px expanded, 76 px collapsed.
- Content maximum: 1440 px; centered beyond that width.

## 6. Radius, border and shadow

| Token         | Value                              | Usage                     |
| ------------- | ---------------------------------- | ------------------------- |
| `radius-sm`   | 8 px                               | Badge and compact control |
| `radius-md`   | 12 px                              | Input, button, menu item  |
| `radius-lg`   | 16 px                              | Standard card             |
| `radius-xl`   | 20 px                              | KPI and major panel       |
| `radius-2xl`  | 24 px                              | Login and modal shell     |
| `radius-full` | 9999 px                            | Avatar, pill and toggle   |
| `shadow-sm`   | `0 1px 2px rgb(39 32 66 / 0.06)`   | Input/card separation     |
| `shadow-md`   | `0 8px 24px rgb(39 32 66 / 0.10)`  | Menu and floating panel   |
| `shadow-lg`   | `0 20px 48px rgb(39 32 66 / 0.16)` | Dialog only               |

- Default card uses a 1 px border plus `shadow-sm`; avoid stacked heavy shadows.

## 7. Motion

| Token         | Duration/easing                 | Usage                   |
| ------------- | ------------------------------- | ----------------------- |
| `motion-fast` | 120 ms ease-out                 | Hover/focus color       |
| `motion-base` | 180 ms ease-out                 | Menu, tooltip and badge |
| `motion-slow` | 240 ms cubic-bezier(.2,.8,.2,1) | Drawer and dialog       |

- Animate opacity and transform; do not animate layout-heavy width/height when avoidable.
- Respect `prefers-reduced-motion`; remove non-essential transform and shorten transitions.
- No decorative auto-playing motion in the operations app.

## 8. Responsive layout

| Range          | Layout rule                                               |
| -------------- | --------------------------------------------------------- |
| `< 640 px`     | One column, 16 px gutters, bottom navigation, row cards   |
| `640–1023 px`  | One/two columns, compact sidebar or drawer, 20 px gutters |
| `1024–1439 px` | Expanded sidebar, 12-column grid, 24 px gutters           |
| `≥ 1440 px`    | Centered 1440 px content area; no unlimited line length   |

- Primary action is visible near page title on desktop and as full-width/sticky action where appropriate on mobile.
- Filters open in a bottom sheet on mobile; essential search remains inline.
- Dense tables must offer card view below 768 px, not horizontal page scrolling.

## 9. Component contracts

### Button

- Variants: primary, secondary, quiet, danger; sizes 36 and 44 px.
- One primary action per section. Destructive confirmation uses explicit verb and entity name.
- Loading retains width and exposes busy state; disabled always includes a reason where ambiguity exists.

### Input and form

- Visible label above control; placeholder never replaces a label.
- Help text precedes error text; error includes icon, message and `aria-describedby`.
- Required status is textual. Validation happens on blur/submit, not on every keystroke for long forms.

### Card and KPI

- KPI order: label, value, comparison/context, optional action.
- A KPI is not clickable unless it has visible affordance and keyboard behavior.
- Operational alert cards use a 4 px semantic leading border plus icon/text.

### Navigation

- Desktop: logo/business name, grouped routes, locale/account at bottom.
- Mobile: maximum five primary bottom items; remaining routes under “Thêm”.
- Active item uses primary-soft background, primary icon and semibold text.

### Table and mobile row card

- Desktop table supports sticky header, server pagination, keyboard focus and aligned numeric columns.
- Mobile card starts with primary identifier/status, then 2-column metadata, then actions.
- Selection and bulk actions are not included until a real workflow requires them.

### Dialog, drawer and toast

- Dialog for confirmation/focused edit; drawer/bottom sheet for mobile filters/details.
- Toast confirms transient success only; errors needing action remain inline or in an alert.
- Focus is trapped and returned to trigger on close.

### Demo banner

- Persistent below global header: “Dữ liệu minh họa — các thao tác nghiệp vụ chưa được lưu thật.”
- Uses warning-soft, warning foreground and beaker icon; cannot be dismissed in Sprint 1.

## 10. Accessibility baseline

- Target WCAG 2.2 AA for contrast, focus, labels and keyboard access.
- Text contrast target ≥ 4.5:1; large text/UI boundaries ≥ 3:1.
- Focus ring: 2 px `--color-focus` plus 2 px surface offset; never remove without replacement.
- Headings follow hierarchy; landmarks include header/nav/main/aside as appropriate.
- Errors are summarized on submit and focus moves to the first invalid field.
- Charts include a textual summary/table and never rely only on color.

## 11. CSS variable contract

```css
:root {
  --color-bg: #fcfbff;
  --color-surface: #ffffff;
  --color-surface-subtle: #f7f5fc;
  --color-primary: #6d5dd3;
  --color-primary-hover: #5c4bc3;
  --color-primary-pressed: #4d3dae;
  --color-primary-soft: #eeeafe;
  --color-accent: #d85c8a;
  --color-accent-soft: #fceaf1;
  --color-text: #292733;
  --color-text-muted: #676371;
  --color-text-subtle: #817d8b;
  --color-border: #e4e0eb;
  --color-border-strong: #c9c3d4;
  --color-focus: #4937b7;
  --color-success: #167a59;
  --color-success-soft: #e5f6ef;
  --color-info: #2468b4;
  --color-info-soft: #e7f1fc;
  --color-warning: #9a5b08;
  --color-warning-soft: #fff2d8;
  --color-danger: #b52e3a;
  --color-danger-soft: #fde9eb;
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.25rem;
  --radius-2xl: 1.5rem;
  --shadow-sm: 0 1px 2px rgb(39 32 66 / 0.06);
  --shadow-md: 0 8px 24px rgb(39 32 66 / 0.1);
  --shadow-lg: 0 20px 48px rgb(39 32 66 / 0.16);
}
```

## 12. Tailwind mapping rule

- Tailwind theme tokens map one-to-one to the CSS variables above: `bg-app`, `bg-surface`, `text-primary`, `text-muted`, `border-default`, semantic colors and named radii/shadows.
- Feature code may use named scale utilities only; arbitrary colors, spacing, radius and shadow values are prohibited.
- Shared UI components own visual variants through typed variant maps; feature pages compose them instead of copying class strings.

## 13. Approval checklist

- [x] Soft Modern visual direction matches the selected UI 3 preview.
- [x] Purple/pastel palette is acceptable for the brand.
- [x] Dashboard density is sufficient for daily operations.
- [x] Desktop table → mobile card behavior is accepted.
- [x] Status and accessibility rules are accepted.
