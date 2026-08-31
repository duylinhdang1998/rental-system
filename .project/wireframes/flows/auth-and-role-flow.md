# Flow — Authentication and Role Access

```mermaid
flowchart TD
  A[Open protected route] --> B{Valid server session?}
  B -- No --> C[Login with intended route]
  C --> D{Credentials and abuse checks pass?}
  D -- No --> E[Generic error / throttled / locked state]
  E --> C
  D -- Yes --> F[Rotate session and load identity]
  B -- Yes --> F
  F --> G{Role/policy allows route?}
  G -- No --> H[403 Access denied]
  G -- Yes --> I[Load typed route data]
  I --> J[Render shell and route]
  J --> K{Logout, lock or expiry?}
  K -- Yes --> L[Revoke session and return to Login]
```

## Acceptance notes

- Login responses do not disclose whether the user exists.
- Owner sees all Sprint 1 routes; Staff does not see or access reports/employees/settings.
- A locked staff fixture loses access even if a previous client state still shows navigation.
- Successful authentication returns only to a safe internal intended route.
