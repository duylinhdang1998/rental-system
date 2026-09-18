# Progress Dashboard — Hệ thống quản lý cho thuê xe máy

## Current Status

**Sprint 0:** COMPLETE — Gate 1 passed  
**Sprint 1:** COMPLETE — Code Review LGTM, QA PASS  
**Sprint 2–3:** COMPLETE — Code Review LGTM, QA PASS  
**Sprint 8–10 (remediation, imports, UI foundation):** COMPLETE — QA PASS  
**Sprint 4:** COMPLETE — Code Review LGTM, QA PASS (2026-09-09)  
**Sprint 5:** COMPLETE — Code Review LGTM, QA PASS (2026-09-10)  
**Sprint 6:** COMPLETE — Code Review LGTM, QA PASS (2026-09-10)  
**Sprint 7:** COMPLETE — Code Review LGTM, QA PASS (2026-09-18)  
**Development:** application scope of the MVP complete; go-live awaits the infrastructure gates and the Product Owner sign-off in `documentation/release-checklist.md`

## Sprint Progress

| Sprint | Completed Tasks | Total Tasks | Status |
|---|---:|---:|---|
| Sprint 0 | 8 | 8 | Complete |
| Sprint 1 | 9 | 9 | Complete |
| Sprint 2 | 7 | 7 | Complete |
| Sprint 3 | 8 | 8 | Complete |
| Sprint 8 | 6 | 6 | Complete (frontend remediation) |
| Sprint 9 | 3 | 3 | Complete (absolute imports) |
| Sprint 10 | 5 | 5 | Complete (UI foundation showroom) |
| Sprint 4 | 7 | 7 | Complete |
| Sprint 5 | 7 | 7 | Complete |
| Sprint 6 | 7 | 7 | Complete |
| Sprint 7 | 7 | 7 | Complete |

## Completed Artifacts

- Requirements scope, SRS and 20 user stories.
- Project context and implementation plan.
- Proposed tech stack, architecture and file blueprints (Sprint 1, 2–3, 4, 5, 6, 8, 10).
- Skill gap verification and team proposal.
- Detailed Sprint 0–7 backlogs.
- Soft Modern design system, Sprint 1 wireframes and backend security plan.
- Private client-input registry with daily-revenue and vehicle-return workbook samples for Sprint 5–6.
- NestJS API, Prisma persistence contracts, opaque sessions, RBAC, CSRF and abuse controls.
- Responsive React SPA on shadcn/Radix with persistent VI/EN locale and Inter typography.
- Fleet, customers, catalogs, availability calendar, versioned pricing, configurable late-return
  fees, overlap-safe multi-vehicle contracts, private handover metadata and bilingual PDF.
- Contract lifecycle (reserved, renting, overdue, returned, cancelled), business-time overdue job,
  reasoned cancellation, whole-period extension repricing, linked vehicle swaps, contract
  list/detail pages and the today/overdue operations board.
- Sprint 4 review LGTM; 111 unit/integration and 36 browser tests pass with all coverage
  metrics above 80%.
- Per-vehicle returns with late-fee snapshots, condition-driven fleet status and derived
  completion; immutable late/damage/other/discount charges; explicit receivable/refund
  settlement with deposit cap, release checklist and frozen figures; live return queue and
  detail-page return/charge/settle dialogs.
- Sprint 5 review LGTM; 151 unit/integration and 37 browser tests pass with all
  coverage metrics above 80%.
- Append-only payment ledger (cash / bank transfer, collection / refund) with explicit caps,
  idempotent replay and ledger-backed settlement figures; receivable list for both roles;
  Owner-only revenue report by business day, employee and contract with receivable aging;
  dependency-free 14-column Excel export; detail-page ledger panel, "Thu tiền" dialog,
  `/receivables` and live `/reports` pages.
- Sprint 6 review LGTM; 192 unit/integration and 40 browser tests pass with all
  coverage metrics above 80%.
- Global request throttling with 429/Retry-After and security events, body limits, hardened
  headers, trusted proxy, request ids, structured JSON logs with redaction, readiness probe,
  Owner audit log API and page, employee create/lock/unlock/reset (US-006, PD-14), idempotent
  Owner seed, backup/restore/drill/backup-age scripts with restore verification, read-only
  load smoke, four runbooks, Vietnamese operator guide with training exercises, release
  checklist, i18n parity gate, axe WCAG 2.2 AA sweep of every route at 360/1280 px, CI
  dependency audit and Playwright job.
- Sprint 7 review LGTM; 239 unit/integration and 65 browser tests pass with all
  coverage metrics above 80%.

## Next Actions

1. Review and merge the pushed branches on GitHub: `feature/sprint-5-return-settlement`,
   `feature/sprint-6-payments-reporting` and `feature/sprint-7-hardening-golive` (each builds
   on the previous one; `main` already carries Sprint 4–5).
2. Product Owner confirms PD-06 (extension repricing), PD-12 (deposit cap, Owner-only
   discount, no early-return refund) and PD-13 (unstyled single-sheet Excel export) or
   requests different rules.
3. Apply migrations `202609090001_contract_lifecycle`, `202609100001_return_settlement` and
   `202609100002_payment_ledger` in staging before the next API deploy.
4. Product Owner confirms PD-14 (employee management scope) and decides PD-08 (legacy
   Excel import).
5. Select the hosting/edge provider (PD-15), then evidence the *infra* gates in
   `documentation/release-checklist.md` B: WAF, managed Postgres restore drill, log shipping
   and alerts, staging load run, shared throttle store if more than one replica.
6. Create the first Owner with `seed:owner`, train Staff with `operator-guide.md`, run the
   witnessed Browser Acceptance Test and sign the release checklist.
