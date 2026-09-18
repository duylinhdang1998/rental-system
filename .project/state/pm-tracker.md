# PM Progress Tracker — Hệ thống quản lý cho thuê xe máy

**Started:** 2026-08-31  
**Current Workstream:** Phase 2 complete (Sprint 11–13); MVP and Phase 2 go-live gates await the hosting provider and the Product Owner decisions
**Overall Progress:** Sprint 0–7 (MVP) and Sprint 11–13 (Phase 2, 3/3) complete; infrastructure go-live gates await the hosting provider
**Status:** SPRINT_13_COMPLETE

## Project Timeline

| Sprint     |               Duration | Focus                                                | Status             |
| ---------- | ---------------------: | ---------------------------------------------------- | ------------------ |
| Sprint 0   |      Checkpoint-driven | Requirements, architecture and UX                    | COMPLETE           |
| Sprint 1   | 2 weeks after approval | UI foundation and product preview                    | COMPLETE — QA PASS |
| Sprint 2   |                2 weeks | Fleet, customers, catalogs and availability calendar | COMPLETE — QA PASS |
| Sprint 3   |                2 weeks | Pricing and contract creation                        | COMPLETE — QA PASS |
| Sprint 4   |                2 weeks | Contract lifecycle, extension, swap and daily board   | COMPLETE — QA PASS |
| Sprint 5   |                2 weeks | Per-vehicle return, charges and settlement           | COMPLETE — QA PASS |
| Sprint 6   |                2 weeks | Payment ledger, receivables and revenue reporting    | COMPLETE — QA PASS |
| Sprint 7   |                2 weeks | Hardening, UAT and go-live preparation                | COMPLETE — QA PASS |
| Sprint 8   |            Remediation | shadcn/Radix, frontend structure, CreatedAt          | COMPLETE — QA PASS |
| Sprint 9   |                Bug fix | Absolute frontend imports and enforcement gate       | COMPLETE — QA PASS |
| UI review  |      Design foundation | Development-only component showroom                  | READY FOR REVIEW   |
| Sprint 11  |                2 weeks | Phase 2: vehicle cost, expenses, break-even          | COMPLETE — QA PASS |
| Sprint 12  |                2 weeks | Phase 2: damage catalog, return photos, cash shift   | COMPLETE — QA PASS |
| Sprint 13  |                2 weeks | Phase 2: advanced reporting and trend charts         | COMPLETE — QA PASS |

## Phase Completion

- [x] Phase 0: Project initialization
- [x] Phase 1: Requirements — approved baseline; later business rules gated by dependency
- [x] Phase 2: System design — Gate 1 approved
- [ ] Phase 3: Development
- [ ] Phase 4: Testing
- [ ] Phase 5: Packaging
- [ ] Phase 6: Deployment
- [ ] Phase 7: Release

## Sprint 0 Decisions

| Decision              | Choice                                                     | Date       |
| --------------------- | ---------------------------------------------------------- | ---------- |
| Wireframes            | Yes                                                        | 2026-08-31 |
| Design direction      | UI 3 — Soft Modern Operations                              | 2026-08-31 |
| Tech Stack            | React + Vite admin, NestJS API, PostgreSQL/Prisma          | 2026-08-31 |
| Backend security      | Layered edge/WAF + NestJS controls                         | 2026-08-31 |
| Team                  | 2 Backend + 2 Frontend workstreams; support roles retained | 2026-08-31 |
| Execute later sprints | No; pause after Sprint 1 UI review                         | 2026-08-31 |

## Gate Checks

| Gate                  | Status                                                            | Date       |
| --------------------- | ----------------------------------------------------------------- | ---------- |
| Gate 1: Planning      | PASSED                                                            | 2026-08-31 |
| Sprint 1 BDD approval | APPROVED — 15 scenarios                                           | 2026-08-31 |
| Sprint 2 execution    | APPROVED; QA PASS                                                 | 2026-09-01 |
| Sprint 3 execution    | AUTHORIZED; configurable late-return rule and system PDF approved | 2026-09-01 |
| Sprint 4 execution    | AUTHORIZED; PD-06 whole-period repricing applied as working default | 2026-09-09 |
| Sprint 5 execution    | AUTHORIZED; PD-12 deposit/discount/early-return defaults applied  | 2026-09-10 |
| Sprint 6 execution    | AUTHORIZED; PD-13 dependency-free workbook writer applied         | 2026-09-10 |
| Sprint 7 execution    | AUTHORIZED; PD-14 employee management (US-006) pulled into the sprint | 2026-09-18 |
| Sprint 11 execution   | AUTHORIZED; PD-16 Phase 2 as its own release, straight-line depreciation as working default | 2026-09-18 |
| Sprint 12 execution   | AUTHORIZED; PD-17 deposit refund as a ledger row after settlement, disk file store as working default | 2026-09-18 |
| Sprint 13 execution   | AUTHORIZED; read-only analytics over the existing ledgers, no schema change, PD-13 writer extended to multi-sheet workbooks | 2026-09-18 |

## Team Status

| Specialist                     | Current Task                                           | Status                    | Sprint |
| ------------------------------ | ------------------------------------------------------ | ------------------------- | ------ |
| apple-ux-wireframer            | Design system and wireframes delivered                 | COMPLETE — APPROVED       | 0      |
| google-code-reviewer           | Sprint 0 artifact review                               | COMPLETE — LGTM           | 0      |
| google-qa-engineer             | Sprint 1 QA/browser acceptance                         | COMPLETE — PASS           | 1      |
| Backend #1, Backend #2         | API, database, auth/security and demo endpoints        | COMPLETE                  | 1      |
| Frontend #1, Frontend #2       | Responsive React SPA and localized previews            | COMPLETE                  | 1      |
| google-code-reviewer           | Sprint 1 code review                                   | COMPLETE — LGTM           | 1      |
| Backend / Frontend specialists | Fleet, customers and availability calendar             | COMPLETE                  | 2      |
| google-code-reviewer           | Sprint 2 code review                                   | COMPLETE — LGTM           | 2      |
| google-qa-engineer             | Sprint 2 regression/browser acceptance                 | COMPLETE — PASS           | 2      |
| Backend / Frontend specialists | Pricing, contracts and configurable late-return policy | COMPLETE                  | 3      |
| google-code-reviewer           | Sprint 3 transaction/security/UI follow-up review      | COMPLETE — LGTM           | 3      |
| google-qa-engineer             | Sprint 3 regression/concurrency/browser acceptance     | COMPLETE — PASS (59 + 19) | 3      |
| Frontend + Backend specialists | Frontend architecture and CreatedAt remediation        | COMPLETE                  | 8      |
| google-code-reviewer           | Sprint 8 architecture/code review                      | COMPLETE — LGTM           | 8      |
| google-qa-engineer             | Sprint 8 regression/browser acceptance                 | COMPLETE — PASS (65 + 22) | 8      |
| meta-react-architect           | Absolute import regression fix and lint/test gate      | COMPLETE                  | 9      |
| google-code-reviewer           | Sprint 9 import architecture review                    | COMPLETE — LGTM           | 9      |
| google-qa-engineer             | Sprint 9 regression/browser acceptance                 | COMPLETE — PASS (66 + 22) | 9      |
| meta-react-architect           | Component showroom and base UI integration             | COMPLETE                  | 10     |
| google-code-reviewer           | UI Foundation measurement and architecture review      | COMPLETE — LGTM           | 10     |
| google-qa-engineer             | UI Foundation regression and browser acceptance        | COMPLETE — PASS (69 + 30) | 10     |
| Backend / Frontend specialists | Lifecycle, overdue job, cancel/extend/swap, daily board | COMPLETE                  | 4      |
| google-code-reviewer           | Sprint 4 state-machine, transaction and UI review      | COMPLETE — LGTM           | 4      |
| google-qa-engineer             | Sprint 4 time-boundary, regression and browser acceptance | COMPLETE — PASS (111 + 36) | 4      |
| Backend / Frontend specialists | Per-vehicle return, charges, settlement, return queue  | COMPLETE                  | 5      |
| google-code-reviewer           | Sprint 5 money, transaction, security and UI review    | COMPLETE — LGTM           | 5      |
| google-qa-engineer             | Sprint 5 money reconciliation, regression and browser acceptance | COMPLETE — PASS (151 + 37) | 5      |
| Backend / Frontend specialists | Payment ledger, receivables, revenue report, Excel export | COMPLETE                  | 6      |
| google-code-reviewer           | Sprint 6 money, idempotency, authorization and UI review | COMPLETE — LGTM           | 6      |
| google-qa-engineer             | Sprint 6 ledger reconciliation, regression and browser acceptance | COMPLETE — PASS (192 + 40) | 6      |
| Backend / Frontend / DevOps specialists | Throttling, logging, readiness, audit log, employees, backup/restore tooling, a11y sweep | COMPLETE | 7 |
| google-code-reviewer           | Sprint 7 security, accessibility and release review    | COMPLETE — LGTM           | 7      |
| google-qa-engineer             | Sprint 7 release scenarios, regression and browser acceptance | COMPLETE — PASS (239 + 65) | 7      |
| Backend / Frontend specialists | Vehicle acquisition, expense ledger with reversals, fleet economics report and workbook, three new screens | COMPLETE | 11 |
| google-code-reviewer           | Sprint 11 money/time, authorization, immutability and UI review | COMPLETE — LGTM           | 11     |
| google-qa-engineer             | Sprint 11 golden-figure reconciliation, regression and browser acceptance | COMPLETE — PASS (292 + 71) | 11     |
| Backend / Frontend specialists | Damage catalog, private return photos, deposit refund row, cash shift close, four new screens | COMPLETE | 12 |
| google-code-reviewer           | Sprint 12 private-file, ledger, authorization and UI review | COMPLETE — LGTM           | 12     |
| google-qa-engineer             | Sprint 12 golden-figure reconciliation, regression and browser acceptance | COMPLETE — PASS (338 + 77) | 12     |
| Backend / Frontend specialists | Revenue by dimension, utilisation, monthly profit and loss, six-sheet and one-sheet workbooks, two new report screens with pure SVG trend charts | COMPLETE | 13 |
| google-code-reviewer           | Sprint 13 reconciliation, authorization, time and UI review | COMPLETE — LGTM           | 13     |
| google-qa-engineer             | Sprint 13 golden-figure reconciliation, regression and browser acceptance | COMPLETE — PASS (384 + 85) | 13     |

## Activity Log

- 2026-08-31: Workbook analyzed; implementation plan created.
- 2026-08-31: Client requested Sprint 0 and Sprint 1 first for UI review.
- 2026-08-31: SRS, scope, user stories, architecture, stack and team proposal drafted.
- 2026-08-31: Sprint 0 paused at mandatory design/stack/team checkpoint.
- 2026-08-31: Client selected React SPA architecture and 2 Backend + 2 Frontend allocation.
- 2026-08-31: Three Dashboard style mockups generated for visual comparison.
- 2026-08-31: Client selected UI 3 and NestJS; backend security was made an explicit Sprint 1/go-live gate.
- 2026-08-31: Soft Modern design system and complete Sprint 1 desktop/mobile wireframe set drafted.
- 2026-08-31: Sprint 1 BDD scenario contract drafted, including abuse, authorization and demo-separation cases.
- 2026-08-31: Client authorized Sprint 0 execution.
- 2026-08-31: Artifact review found and resolved traceability, demo-policy, file-blueprint, roadmap and document-size issues; re-review LGTM.
- 2026-08-31: Detailed Sprint 2–7 backlog files added; execution remains deferred after Sprint 1.
- 2026-08-31: Gate 1 structural preflight passed; Product Owner approvals remain blocking.
- 2026-08-31: Received and privately archived the daily-revenue and vehicle-return Excel samples; linked them to Sprint 4–6 dependencies.
- 2026-08-31: Product Owner approved Gate 1 and authorized Sprint 1; Sprint 0 closed COMPLETE.
- 2026-08-31: Sprint 1 Batch 0 complete — 15 approved scenarios mapped to six RED test skeletons.
- 2026-09-01: Sprint 1 backend/frontend implementation completed and all first-round review findings resolved.
- 2026-09-01: Final gates passed — build/format/lint/typecheck, 21 tests, 10 browser tests, 80%+ coverage, Prisma validation and dependency audit.
- 2026-09-01: Sprint 1 closed COMPLETE; Sprint 2 remains deferred for Product Owner UI review.
- 2026-09-01: Client authorized Sprint 2–3 and requested GitHub delivery.
- 2026-09-01: Sprint 0–1 baseline committed and pushed to GitHub (`fe5e1e9`).
- 2026-09-01: Sprint 2–3 BDD, wireframes and exact file blueprint drafted for mandatory approval.
- 2026-09-01: Sprint 2 delivered fleet/customer CRUD, controlled status history, private-document policy and room-style vehicle availability calendar.
- 2026-09-01: Sprint 2 review LGTM; 34 unit/integration and 15 browser tests passed with all coverage dimensions above 80%.
- 2026-09-01: Sprint 3 delivered versioned pricing, strict planned 24-hour blocks, configurable late-return fees, immutable per-vehicle snapshots, overlap-safe multi-vehicle contracts, private handover metadata and bilingual PDF export.
- 2026-09-01: Client approved 60 free late minutes, 20.000 VND per started hour afterwards, Owner configuration and the system PDF until a client template arrives.
- 2026-09-01: Sprint 3 follow-up review LGTM; 59 unit/integration and 19 browser tests passed with all coverage dimensions above 80%.
- 2026-09-01: Client rejected the initial frontend architecture for missing shadcn/Radix,
  flat feature internals, native controls, inline list forms, typography and CreatedAt gaps.
- 2026-09-01: Sprint 8 remediation completed with shadcn/Radix primitives split to VFM
  one-component-per-file standards, deep feature grouping, dedicated dialogs/calendar overlay,
  Inter and CreatedAt across persistence/contracts/current UI.
- 2026-09-01: Sprint 8 review LGTM and QA PASS; 65 unit/integration and 22 browser tests pass,
  all coverage dimensions remain above 80%, and local FE/BE health checks return HTTP 200.
- 2026-09-01: Client identified that Sprint 8 left relative imports despite an existing `@/`
  alias; root cause was a missing enforcement gate.
- 2026-09-01: Sprint 9 converted 194 imports across 94 frontend source files, added Vitest
  and ESLint regression gates, and passed review plus QA (66 unit/integration, 22 browser).
- 2026-09-01: Product Owner paused business sprint execution and requested a component-first
  UI review workflow; showroom scenarios, blueprint and desktop/mobile wireframes drafted.
- 2026-09-01: Product Owner approved the showroom contract; `/ui-kit` delivered tokens,
  buttons, fields, selection, data-display, feedback and overlay specimens without business API calls.
- 2026-09-01: UI Foundation re-review LGTM after typography-token, route-boundary,
  section-catalog and BDD coverage findings were resolved.
- 2026-09-01: UI Foundation QA PASS — 69 unit/integration and 30 browser tests passed,
  all coverage dimensions exceed 80%, production excludes `/ui-kit`, and dependency audit is clean.
- 2026-09-09: Client asked to install dependencies and execute Sprint 4 per plan; 17 lifecycle
  BDD scenarios and the Sprint 4 file blueprint were drafted before implementation.
- 2026-09-09: Sprint 4 delivered the contract state machine (CONFIRMED/ACTIVE/OVERDUE/COMPLETED/
  CANCELLED), the idempotent business-time overdue job, reasoned cancellation, whole-period
  extension repricing from the contract snapshot (PD-06 default), linked vehicle swaps, vehicle
  status synchronization, contract list/detail pages and the today/overdue operations board.
- 2026-09-09: Sprint 4 review LGTM after label, test-alias and e2e sign-in race fixes; QA PASS with
  111 unit/integration and 36 browser tests, all coverage dimensions above 80%.
- 2026-09-10: Client asked to push Sprint 4 and execute Sprint 5; the push was refused by GitHub
  (403, the local Git account has no write access to the client repository) and is pending.
- 2026-09-10: 18 return/settlement BDD scenarios, the `09-return-settlement.md` wireframe and
  the Sprint 5 file blueprint were drafted before implementation.
- 2026-09-10: Sprint 5 delivered per-vehicle returns with late-fee snapshots and condition-driven
  fleet status, derived contract completion, immutable late/damage/other/discount charges,
  explicit receivable/refund settlement with deposit cap and release checklist, frozen
  settlement figures, the live return queue and the detail-page return/charge/settle dialogs.
- 2026-09-10: Sprint 5 review LGTM after component-split, test-timeout, demo-seed and currency
  assertion fixes; QA PASS with 151 unit/integration and 37 browser tests, all
  coverage dimensions above 80%.
- 2026-09-10: Client asked to continue with the next sprint; 14 finance/reporting BDD scenarios,
  the `10-finance-reporting.md` wireframe and the Sprint 6 file blueprint were drafted before
  implementation.
- 2026-09-10: Sprint 6 delivered the append-only payment ledger (cash / bank transfer,
  collection / refund, explicit caps, idempotent replay, Serializable write + event + audit),
  ledger-backed settlement figures, the receivable list for both roles, the Owner-only revenue
  report by business day / employee / contract with receivable aging, the dependency-free
  14-column Excel export (PD-13), the detail-page ledger panel and "Thu tiền" dialog, the
  `/receivables` page and the live `/reports` page.
- 2026-09-10: Sprint 6 review LGTM after component-split, ZIP-writer readability, e2e race and
  golden-tier fixes; QA PASS with 192 unit/integration and 40 browser tests, all coverage
  dimensions above 80%. GitHub push still refused (403); commits are ready on local branches.
- 2026-09-18: Client asked to continue with the next sprints; 13 release-hardening and 8
  employee-management BDD scenarios, the `11-employees-audit.md` wireframe and the Sprint 7
  file blueprint were drafted before implementation. US-006 (never assigned to a sprint) was
  pulled in as PD-14.
- 2026-09-18: Sprint 7 delivered global sliding-window throttling with 429/Retry-After and
  security events, body limits, hardened headers, trusted proxy, request ids, structured JSON
  logs with redaction, readiness probe, the Owner audit log API and page, employee
  create/lock/unlock/reset with session revocation, the idempotent Owner seed, backup /
  restore / restore-drill / backup-age scripts with `verify:restore`, a read-only load smoke,
  four runbooks, the Vietnamese operator guide, the release checklist, an i18n parity gate and
  an axe WCAG 2.2 AA sweep of every route at 360 px and 1280 px; CI gained the dependency
  audit, format check and a Playwright job.
- 2026-09-18: Sprint 7 review LGTM after component-split, complexity, guard-wiring, contrast /
  keyboard and browser-timeout fixes; QA PASS with 239 unit/integration and 65 browser tests,
  all coverage dimensions above 80%. Provider-side gates (edge WAF, managed Postgres drill,
  shared throttle store, staging load run, witnessed BAT) stay open in `release-checklist.md`.
- 2026-09-18: GitHub access restored; `main` (Sprint 4–5), `feature/sprint-5-return-settlement`,
  `feature/sprint-6-payments-reporting` and `feature/sprint-7-hardening-golive` were pushed to
  `duylinhdang1998/rental-system`.
- 2026-09-18: Phase 2 split into Sprint 11 (asset economics), Sprint 12 (damage catalog,
  return photos, cash shift close, deposit refund) and Sprint 13 (advanced reporting and trend
  charts) in `planning/phase-2-roadmap.md`; Epic I user stories US-023–US-030, BR-09/BR-10 and
  FR-12 added; PD-16 recorded.
- 2026-09-18: Sprint 11 delivered vehicle acquisition records with straight-line depreciation
  (shared math in `@rental/contracts`), an append-only expense ledger with idempotent replay,
  filters and Owner reversal entries, per-vehicle revenue attribution from contract snapshots,
  the Owner-only fleet economics report with break-even projection and the "Đội xe" workbook,
  the "Giá vốn" dialog on the vehicle list, the `/expenses` page for both roles, the
  `/reports/fleet` page with the shared report tab strip and three new audit actions.
- 2026-09-18: Sprint 11 review LGTM after component/hook splits, test-file splits and a phone
  KPI-grid overflow fix; QA PASS with 292 unit/integration and 71 browser tests, all coverage
  dimensions above 80%. Branch `feature/sprint-11-asset-economics` builds on Sprint 7.
- 2026-09-18: Client asked to continue with the next sprints; 14 operations-finance BDD
  scenarios, the `13-operations-finance.md` wireframe and the Sprint 12 file blueprint were
  drafted before implementation. PD-17 (deposit refund moves out of the settlement checklist
  into its own ledger row) recorded.
- 2026-09-18: Sprint 12 delivered the Owner damage catalog with catalog-priced return and
  manual charges (price and name copied at charge time), private return-photo uploads behind
  a file-store port with HMAC signed links (300 s, no-store), the `DEPOSIT_REFUND` ledger row
  with the "Hoàn cọc" action after settlement (PD-17), cash shifts with expected cash from the
  payment and expense ledgers, counted close, frozen variance and note rule, the
  `/settings/damage-items` and `/cash-shifts` pages, the catalog select and photo field in the
  return and charge dialogs, the photo gallery on the contract detail and six new audit actions.
- 2026-09-18: Sprint 12 review LGTM after component splits, a test-file split and two browser
  journeys realigned with PD-17; QA PASS with 338 unit/integration and 77 browser tests, all
  coverage dimensions above 80%. Branch `feature/sprint-12-operations-finance` builds on
  Sprint 11.
- 2026-09-18: Client asked to continue with the next sprints; 14 advanced-reporting BDD
  scenarios, the `14-advanced-reporting.md` wireframe and the Sprint 13 file blueprint were
  drafted before implementation.
- 2026-09-18: Sprint 13 delivered the read-only analytics module: revenue events accrued once
  and grouped by vehicle type, vehicle, customer nationality and month (every table reconciles
  to one total, unallocated revenue visible), surcharges by kind, utilisation per vehicle /
  type / fleet, the monthly profit and loss (revenue − expenses − straight-line depreciation)
  with a 24-month cap, the six-sheet "Phân tích" and one-sheet "Lãi lỗ" workbooks through
  the extended dependency-free writer, the `/reports/analytics` and `/reports/pnl` Owner
  pages with the 366-day range guard and pure inline-SVG trend charts (no chart library,
  table fallback, accessible names).
- 2026-09-18: Sprint 13 review LGTM after component splits, a shared KPI-card overflow fix
  and browser journeys realigned with the demo fleet; QA PASS with 384 unit/integration and
  85 browser tests, all coverage dimensions above 80%. Phase 2 (Sprint 11–13) is complete on
  branch `feature/sprint-13-advanced-reporting`, which builds on Sprint 12.

## Blockers

| Blocker                                       | Required action                          | Owner     |
| --------------------------------------------- | ---------------------------------------- | --------- |
| PD-06 extension repricing applied as default  | Product Owner confirms or changes the rule | Client/BA |
| PD-12 settlement defaults applied             | Product Owner confirms deposit cap, Owner-only discount, no early-return refund | Client/BA |
| PD-13 workbook writer applied                 | Product Owner confirms the unstyled single-sheet export or requests styling/library | Client/BA |
| PD-14 employee management delivered in Sprint 7 | Product Owner confirms US-006 scope (create, lock, unlock, reset) | Client/BA |
| Hosting / edge provider not selected          | Select the provider so the WAF, managed Postgres drill, log shipping and staging load run can be evidenced | Client/DevOps |
| PD-08 legacy Excel import undecided           | Decide before go-live; if yes, supply the source workbook for a staging import | Client/BA |
| PD-16 Phase 2 release and depreciation method  | Product Owner confirms Phase 2 ships as its own release and straight-line depreciation (or asks for another method) | Client/BA |
| PD-17 deposit refund after settlement, disk file store | Product Owner confirms "Hoàn cọc" as a ledger step after "Tất toán" and the single-replica disk store (or asks for object storage before go-live) | Client/BA |

**Last Updated:** 2026-09-18  
**Updated By:** Project Manager
