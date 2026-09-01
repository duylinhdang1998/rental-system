# Sprint 2: Fleet, Customers and Catalog Foundations

**Sprint:** 2 of 8  
**Duration:** 2 weeks after Sprint 1 UI approval  
**Goal:** Quản lý được dữ liệu xe, khách hàng và danh mục nền phục vụ hợp đồng.  
**Status:** COMPLETE — QA PASS

## Task Details

### Task 2.S: Fleet and customer BDD scenarios [QA]
**Status:** [COMPLETE]
**Story Points:** 5  
**Wireframe:** `06-fleet-customer-management.md`

**Deliverables:** Approved `.feature` scenarios for US-007 catalog foundation, US-008 and US-009.  
**Acceptance Criteria:** CRUD, search/filter, blacklist warning, permissions and mobile behavior are testable.

### Task 2.1: Fleet and catalog data/API [Backend]
**Status:** [COMPLETE]
**Story Points:** 8  
**Wireframe:** -

**Deliverables:** Vehicle/type/image/status models, migrations, APIs and audit.  
**Acceptance Criteria:** Constraints and state transitions pass approved BDD/integration tests.

### Task 2.2: Customer data/API [Backend]
**Status:** [COMPLETE]
**Story Points:** 8  
**Wireframe:** -

**Deliverables:** Customer/contact/document/tag/blacklist APIs with private-file policy.  
**Acceptance Criteria:** Duplicate search, PII access and blacklist warnings pass tests.

### Task 2.3: Fleet management UI [Frontend]
**Status:** [COMPLETE]
**Story Points:** 8  
**Wireframe:** `06-fleet-customer-management.md`

**Deliverables:** Responsive vehicle list/detail/forms, filters and status history.  
**Acceptance Criteria:** Desktop/mobile, all view states and authorization behavior match BDD.

### Task 2.4: Customer and catalog UI [Frontend]
**Status:** [COMPLETE]
**Story Points:** 8  
**Wireframe:** `06-fleet-customer-management.md`

**Deliverables:** Responsive customer list/detail/forms, warning and catalog screens.  
**Acceptance Criteria:** Search, tags, blacklist and private-data treatment match BDD.

### Task 2.R: Sprint 2 code review [Code Review]
**Status:** [COMPLETE]
**Story Points:** 3  
**Wireframe:** -

**Deliverables:** Architecture, security and design-system review.  
**Acceptance Criteria:** LGTM after findings are fixed.

### Task 2.Q: Sprint 2 QA verification [QA]
**Status:** [COMPLETE]
**Story Points:** 5  
**Wireframe:** -

**Deliverables:** Regression, coverage and desktop/mobile acceptance report.  
**Acceptance Criteria:** BDD green, build green and implemented logic coverage ≥80%.

## Sprint Backlog

| ID | Task | Points | Status | Assignee | Wireframe |
|----|------|--------|--------|----------|-----------|
| 2.S | Fleet/customer BDD scenarios | 5 | [COMPLETE] | QA | `06-fleet-customer-management.md` |
| 2.1 | Fleet and catalog data/API | 8 | [COMPLETE] | Backend | - |
| 2.2 | Customer data/API | 8 | [COMPLETE] | Backend | - |
| 2.3 | Fleet management UI | 8 | [COMPLETE] | Frontend | `06-fleet-customer-management.md` |
| 2.4 | Customer and catalog UI | 8 | [COMPLETE] | Frontend | `06-fleet-customer-management.md` |
| 2.R | Sprint 2 code review | 3 | [COMPLETE — LGTM] | Code Review | - |
| 2.Q | Sprint 2 QA verification | 5 | [COMPLETE — PASS] | QA | - |

## Sprint Summary

**Total:** 7 tasks · 45 points · all four batches complete.

QA evidence: 34 unit/integration tests and 15 browser journeys passed. Coverage reached
94.93% statements, 80.88% branches, 91.94% functions and 95.78% lines. Format, lint,
typecheck, production build, Prisma validation and high-severity dependency audit passed.

## Definition of Done

- [x] Approved BDD and expanded CRUD wireframes before development.
- [x] Fleet/customer APIs and responsive UI pass tests and build.
- [x] Code review LGTM and QA regression/coverage approved.

## Dependencies and Risks

- Depends on Sprint 1 auth, shell, API platform and approved UI review.
- Detailed create/edit wireframes must be expanded before Sprint 2 Gate 2.
- Customer documents require private storage and server authorization from first implementation.
