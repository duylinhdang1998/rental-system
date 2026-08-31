# Flow — Sprint 1 Operations Preview

```mermaid
flowchart LR
  A[Login] --> B[Dashboard]
  B --> C{Choose operational item}
  C --> D[Vehicle preview]
  C --> E[Contract preview]
  C --> F[Return queue preview]
  C --> G[Owner report preview]
  D --> H[Read-only detail drawer]
  E --> H
  F --> H
  G --> I[Chart + text summary]
  H --> J{Mutation requested?}
  J -- Yes --> K[Disabled: target sprint disclosed]
  J -- No --> B
```

## Acceptance notes

- Demo banner stays visible across every preview.
- Overdue and due-soon items appear before neutral operational items.
- No preview mutation pretends to persist data.
- Dashboard, list and detail use consistent status language.
