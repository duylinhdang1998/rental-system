# User Stories — Hệ thống quản lý cho thuê xe máy

**Status:** Approved planning baseline  
**Total:** 22 stories
**Usage:** BDD, development and QA must read this index and every linked epic in scope.

## Epic Index

| Epic                               | Stories       | Scope                                                    | Detail                                                                              |
| ---------------------------------- | ------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| A — UI Foundation and Access       | US-001–US-005 | Sprint 1 secure responsive preview                       | [epic-a-ui-foundation.md](user-stories/epic-a-ui-foundation.md)                     |
| B — Employees and Configuration    | US-006–US-007 | Employees, catalogs and pricing                          | [epic-b-employees-configuration.md](user-stories/epic-b-employees-configuration.md) |
| C — Fleet and Customers            | US-008–US-009 | Vehicle and customer source data                         | [epic-c-fleet-customers.md](user-stories/epic-c-fleet-customers.md)                 |
| D — Contracts                      | US-010–US-015 | Creation, pricing, handover and lifecycle                | [epic-d-contracts.md](user-stories/epic-d-contracts.md)                             |
| E — Return, Settlement and Finance | US-016–US-018 | Partial returns, settlement and receipts                 | [epic-e-return-finance.md](user-stories/epic-e-return-finance.md)                   |
| F — Reporting and Safety           | US-019–US-020 | Reporting, audit and recovery                            | [epic-f-reporting-safety.md](user-stories/epic-f-reporting-safety.md)               |
| G — Frontend Architecture          | US-021        | Approved component stack and maintainable UI boundaries  | [epic-g-frontend-architecture.md](user-stories/epic-g-frontend-architecture.md)     |
| H — UI Component Review            | US-022        | Standalone component showroom and staged visual approval | [epic-h-ui-component-review.md](user-stories/epic-h-ui-component-review.md)         |

## Traceability Summary

| Release              | Stories                                                             |
| -------------------- | ------------------------------------------------------------------- |
| Sprint 1             | US-001, US-002, US-003, US-004, US-005                              |
| Sprint 2             | US-007 (catalog foundation), US-008, US-009                         |
| Sprint 3             | US-007 (pricing), US-010, US-011, US-012, US-013                    |
| Sprint 4             | US-014, US-015                                                      |
| Sprint 5             | US-016, US-017                                                      |
| Sprint 6             | US-018, US-019                                                      |
| Sprint 7             | US-020 plus cross-story hardening and UAT                           |
| Sprint 8             | US-021 frontend architecture remediation before later business work |
| UI foundation review | US-022; business Sprint 4–7 remains paused                          |

## Approval Contract

Approval of this index approves the linked Given/When/Then story set as the planning
baseline. Business assumptions that are still open remain explicit in
`.project/requirements/srs.md` and must be resolved before their dependent sprint begins.
