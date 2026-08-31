# Wireframes — Sprint 0

**Status:** APPROVED — GATE 1  
**Direction:** UI 3 — Soft Modern Operations  
**Visual reference:** `../design-previews/03-soft-modern.png`  
**Design contract:** `../design-system.md`

## Screen set

| File | Screen | Desktop | Mobile | Status |
|---|---|---:|---:|---|
| `screens/01-login.md` | Login | Yes | Yes | Draft complete |
| `screens/02-app-shell.md` | Navigation and workspace shell | Yes | Yes | Draft complete |
| `screens/03-dashboard.md` | Operations dashboard | Yes | Yes | Draft complete |
| `screens/04-module-previews.md` | Vehicles, customers, contracts, returns, reports | Yes | Yes | Draft complete |
| `screens/05-states-and-access.md` | Loading, empty, error, access denied | Yes | Yes | Draft complete |
| `components.md` | Reusable UI patterns | N/A | N/A | Draft complete |

## Flow set

- `flows/auth-and-role-flow.md`
- `flows/operations-preview-flow.md`
- `flows/locale-and-responsive-flow.md`

## Sprint 1 scope boundary

- Screens use clearly labelled demo data served by a guarded NestJS demo API.
- Login/session and Owner/Staff route protection are real Sprint 1 foundations.
- Vehicle, customer, contract, return and report mutations are previews only; buttons say which later sprint enables them.
- Sprint 2+ remains paused after the Sprint 1 UI review.

## Approval gate

Client approval was recorded on 2026-08-31. This wireframe set and the Sprint 1 BDD scenarios are the implementation contract.
