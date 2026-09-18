# Sprint 12: Operations Finance — Damage Catalog, Return Photos, Deposit Refund and Cash Shift

**Sprint:** 12 (Phase 2, second of three)  
**Duration:** 2 weeks  
**Goal:** Quầy chặt chẽ về tiền và bằng chứng: giá hư hỏng lấy từ bảng giá, ảnh nhận xe lưu riêng tư, hoàn cọc qua sổ và mỗi ca tiền mặt đều được đếm.  
**Status:** COMPLETE (2026-09-18) — Code Review LGTM, QA PASS

## Task Details

### Task 12.S: Operations finance BDD scenarios [QA]
**Status:** [COMPLETE]
**Story Points:** 5  
**Wireframe:** `13-operations-finance.md`

**Deliverables:** 14 scenarios (three outlines) in `.project/scenarios/sprint-12/operations-finance.feature` covering US-026, US-027 and US-028 with golden cash-shift and deposit figures.  
**Acceptance Criteria:** Catalog pricing, upload refusal, deposit-refund uniqueness, expected-cash math and role visibility are explicit.

### Task 12.1: Damage catalog and catalog-priced charges [Backend]
**Status:** [COMPLETE]
**Story Points:** 5  
**Wireframe:** -

**Deliverables:** `DamageItem` persistence (demo + Prisma), Owner CRUD with audits, Staff read of active items, `damageItemId` on return and manual charges resolved to the catalog price and name with metadata (`ChargePricingService`).  
**Acceptance Criteria:** Duplicate code 409, inactive 409, unknown 404, Staff writes 403, free text still accepted — `tests/api/damage-catalog.test.ts`, `tests/domain/damage-catalog.test.ts`.

### Task 12.2: Return photos and private file links [Backend]
**Status:** [COMPLETE]
**Story Points:** 5  
**Wireframe:** -

**Deliverables:** Private file store port (memory / disk), signed-link service and public streaming route, upload route with magic-byte and size/count limits under its own throttle policy, per-line photo links.  
**Acceptance Criteria:** Keys and names never leak, links expire after 300 s, tampered links 404, refusals write nothing — `tests/api/return-photos.test.ts`, `tests/domain/signed-link.test.ts`.

### Task 12.3: Deposit refund ledger entry [Backend]
**Status:** [COMPLETE]
**Story Points:** 3  
**Wireframe:** -

**Deliverables:** `DEPOSIT_REFUND` payment kind excluded from revenue and caps, one-shot refund route with replay, `DEPOSIT_REFUNDED` event and audit, settlement checklist without the up-front deposit gate (PD-17).  
**Acceptance Criteria:** 409 for not settled / nothing due / already refunded; balance reports `depositRefundedVnd` — `tests/api/deposit-refund.test.ts`, `tests/domain/contract-payment.test.ts`, `tests/domain/revenue-report.test.ts`.

### Task 12.4: Cash shift open / close [Backend]
**Status:** [COMPLETE]
**Story Points:** 8  
**Wireframe:** -

**Deliverables:** `CashShift` persistence, expected cash from the payment and expense ledgers inside the shift window, close with counted amount, frozen variance and note rule, role-scoped list, audits.  
**Acceptance Criteria:** Golden figures reconcile; one open shift at a time; Staff sees own shifts only — `tests/api/cash-shifts.test.ts`, `tests/domain/cash-shift.test.ts`.

### Task 12.5: Catalog settings, return photos and deposit refund UI [Frontend]
**Status:** [COMPLETE]
**Story Points:** 8  
**Wireframe:** `13-operations-finance.md`

**Deliverables:** Settings tab strip and `/settings/damage-items` page with add / edit / toggle dialogs, "Hạng mục hư hỏng" select in the return and charge dialogs, photo field with upload-then-return, gallery on the contract detail, "Hoàn cọc" action, dialog and badges, ledger and balance labels.  
**Acceptance Criteria:** Validation mirrors the API, Owner-only affordances never render for Staff, axe sweep passes — `tests/admin/damage-catalog-presentation.test.ts`, `tests/admin/return-form.test.ts`, `e2e/operations-finance.spec.ts`.

### Task 12.6: Cash shift page [Frontend]
**Status:** [COMPLETE]
**Story Points:** 5  
**Wireframe:** `13-operations-finance.md`

**Deliverables:** `/cash-shifts` page for both roles: current-shift card with live expectation, open / close dialogs with variance preview and note rule, history table / cards with variance badges, navigation entry.  
**Acceptance Criteria:** Note required on variance, negative money with a true minus sign, Owner sees the opener — `tests/admin/cash-shift-presentation.test.ts`, `e2e/operations-finance.spec.ts`.

### Task 12.R: Sprint 12 code review [Code Review]
**Status:** [COMPLETE]
**Story Points:** 3  
**Wireframe:** -

**Deliverables:** `.project/reviews/sprint-12-code-review.md`.  
**Acceptance Criteria:** LGTM after three blocking findings (component length, test length / casts, browser journeys vs PD-17) were fixed.

### Task 12.Q: Sprint 12 QA verification [QA]
**Status:** [COMPLETE]
**Story Points:** 5  
**Wireframe:** -

**Deliverables:** `.project/state/specialists/google-qa-engineer-sprint-12.md`.  
**Acceptance Criteria:** BDD, regression, browser and coverage gates pass — 338 unit/integration, 77 browser, coverage above 80 % on every dimension.

## Sprint Backlog

| ID | Task | Points | Status | Assignee | Wireframe |
|----|------|--------|--------|----------|-----------|
| 12.S | Operations finance BDD scenarios | 5 | [COMPLETE] | QA | `13-operations-finance.md` |
| 12.1 | Damage catalog and catalog-priced charges | 5 | [COMPLETE] | Backend | - |
| 12.2 | Return photos and private file links | 5 | [COMPLETE] | Backend | - |
| 12.3 | Deposit refund ledger entry | 3 | [COMPLETE] | Backend | - |
| 12.4 | Cash shift open / close | 8 | [COMPLETE] | Backend | - |
| 12.5 | Catalog settings, return photos and deposit refund UI | 8 | [COMPLETE] | Frontend | `13-operations-finance.md` |
| 12.6 | Cash shift page | 5 | [COMPLETE] | Frontend | `13-operations-finance.md` |
| 12.R | Sprint 12 code review | 3 | [COMPLETE] | Code Review | - |
| 12.Q | Sprint 12 QA verification | 5 | [COMPLETE] | QA | - |

## Definition of Done

- [x] Every scenario in `operations-finance.feature` is covered by a green test.
- [x] Lint, typecheck, unit/integration, coverage ≥ 80 %, build, Prisma validation, audit and browser suites pass.
- [x] Code review LGTM and QA PASS.
- [x] Operator guide gains the new screens (Sprint 12 version).

## Dependencies and Risks

- Builds on Sprint 11 (`feature/sprint-11-asset-economics`); branch `feature/sprint-12-operations-finance`.
- Migration `202609180002_operations_finance` ships with the Phase 2 release together with
  `202609180001_asset_economics`.
- The disk file store is a single-replica default (`PRIVATE_FILE_DIR`); object storage
  (S3-compatible) behind the same port is a go-live gate for scaling out, like the throttle store.
- The settlement checklist changed behaviour (PD-17): the deposit refund is no longer confirmed
  inside "Tất toán" but recorded afterwards through "Hoàn cọc". Operators must be told; the
  operator guide describes the new step.
