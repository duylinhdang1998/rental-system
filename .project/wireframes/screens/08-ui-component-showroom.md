# Screen 08 — UI Component Showroom

**Purpose:** A neutral review surface for approving the visual foundation one component at a
time before styles are rolled into operational screens.

## Desktop

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ UI FOUNDATION                                      [Draft 01]  Local review │
│ Xem, so sánh và duyệt từng component trước khi áp dụng vào màn hình thật.   │
├───────────────────┬──────────────────────────────────────────────────────────┤
│ FOUNDATION        │ FOUNDATION TOKENS                                        │
│ • Tokens          │ [Color swatches] [Typography] [Radius] [Shadow]          │
│                   │                                                          │
│ COMPONENTS        │ BUTTONS                                      #buttons   │
│ • Buttons         │ Primary  Secondary  Outline  Quiet  Danger              │
│ • Fields          │ Default   Hover   Focus   Disabled   Loading             │
│ • Selection       │                                                          │
│ • Data display    │ FIELDS                                       #fields    │
│ • Feedback        │ Label                                                     │
│ • Overlay         │ [ Default value________________ ]                         │
│                   │ [ Invalid______________________ ]  Error message          │
│                   │                                                          │
│                   │ DATA DISPLAY                                  #data      │
│                   │ [Available] [Rented] [Overdue]   [KPI card]              │
│                   │ ┌────────────┬────────────┬────────────┐                 │
│                   │ │ Header     │ Header     │ Header     │                 │
│                   │ └────────────┴────────────┴────────────┘                 │
└───────────────────┴──────────────────────────────────────────────────────────┘
```

## Mobile — 360 px

```text
┌──────────────────────────────┐
│ UI FOUNDATION     [Draft 01] │
│ Duyệt từng component         │
├──────────────────────────────┤
│ [Tokens ▼]  jump navigation  │
├──────────────────────────────┤
│ BUTTONS                      │
│ [ Primary — full width     ] │
│ [ Secondary               ] │
│ [ Disabled                ] │
│                              │
│ FIELDS                       │
│ Label                        │
│ [ Default________________ ] │
│ Error label                  │
│ [ Invalid________________ ] │
│ Error message                │
│                              │
│ DATA DISPLAY                 │
│ [Available] [Rented]         │
│ ┌──────────────────────────┐ │
│ │ Responsive data card     │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

## Review Rules

- Each section has a stable hash link so feedback can name one component precisely.
- States are presented side by side on desktop and stacked on mobile.
- The showroom background stays visually quiet; specimens—not decoration—are the focus.
- All controls use Lucide icons, visible labels and at least 44 px touch targets.
- Approval happens component by component; no styling is propagated to business screens
  until the corresponding specimen is accepted.
