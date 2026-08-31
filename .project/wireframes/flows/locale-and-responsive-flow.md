# Flow — Locale and Responsive Navigation

```mermaid
flowchart TD
  A[Open app] --> B[Load saved locale or default vi]
  B --> C{Viewport below 640 px?}
  C -- No --> D[Desktop sidebar + table layout]
  C -- Yes --> E[Mobile bottom nav + card layout]
  D --> F[User changes locale]
  E --> F
  F --> G[Update dictionary and locale formatting]
  G --> H[Persist preference]
  H --> I[Keep current route/filter/session]
  I --> C
```

## Acceptance notes

- Resizing does not lose route, filter or session state.
- Tables become cards without dropping critical identifier, status, deadline or primary action.
- Locale switching changes UI copy/date/currency only, never business data.
- 360 px viewport has no page-level horizontal overflow.
