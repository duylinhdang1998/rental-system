# Epic G — Frontend Architecture Remediation

## US-021 — Consistent operational UI foundation

As an Owner or Staff member, I want every administration screen to use the approved
component system and predictable interaction patterns so that the product remains usable,
accessible and maintainable as more modules are added.

### Priority

MUST — remediation required before later feature sprints.

### Acceptance criteria

- Given the admin application is loaded, when any implemented route renders, then Inter is
  the active sans-serif font and form controls are composed from shadcn/ui with Radix-backed
  primitives where applicable.
- Given application source outside the shared UI registry, when architecture checks run,
  then native `button`, `input`, `select` and `textarea` elements are rejected.
- Given a feature module, when its source tree is inspected, then route pages, components,
  hooks, API adapters and utilities are nested by responsibility; state/query hooks are not
  declared in component files.
- Given the vehicle or customer list at 360 pixels, when the primary actions render, then
  their labels stay on one line and the page has no horizontal overflow.
- Given Staff selects “Thêm xe” or “Thêm khách hàng”, when the action is activated, then a
  keyboard-accessible dialog opens and the form is not inserted inline above the list.
- Given Staff selects “Lịch xe”, when the action is activated, then the availability calendar
  opens in a dedicated overlay with a visible title, close control and focus management.
- Given vehicle, customer, pricing or contract data is returned, when its record is displayed,
  then an ISO `createdAt` value is present in the contract and a localized “Ngày tạo” value is
  visible on the corresponding implemented table, card or summary.
