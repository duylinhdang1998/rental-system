# Fleet → Customer → Contract Flow

```text
Owner catalog setup
        │
        ▼
Vehicle types ──► Vehicle create/edit ──► Controlled status history
        │                                      │
        └──────────────────┬───────────────────┘
                           ▼
Customer search ── duplicate? ── yes ──► Existing profile
        │                    │
        │                    no
        ▼                    ▼
Blacklist? ─ yes ─► Warning acknowledgement
        │                    │
        └────────────┬───────┘
                     ▼
Contract wizard: Customer → Vehicles → Pricing → Handover → Confirmation
                     │                       │                 │
                     │ conflict              │ invalid file    │ atomic commit
                     ▼                       ▼                 ▼
             Preserve form + retry     Inline recovery   Detail + PDF
```

## State rules

1. Catalog mutation is Owner-only; Staff consumes catalogs.
2. Vehicle/customer writes use validated server contracts and append-only audit events.
3. Customer document/image bytes stay in private storage; APIs expose short-lived descriptors.
4. A quote is disposable; a confirmed contract stores immutable price and customer/vehicle snapshots.
5. Confirmation re-checks every vehicle in one transaction; any conflict rolls back the whole contract.
6. User-entered wizard state survives recoverable validation/network/conflict errors.
