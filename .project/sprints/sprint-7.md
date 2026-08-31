# Sprint 7: Hardening, UAT and Go-live

**Sprint:** 7 of 8  
**Duration:** 2 weeks  
**Goal:** Chứng minh hệ thống an toàn, khôi phục được và sẵn sàng dùng thật.  
**Status:** PLANNED — EXECUTION DEFERRED

## Task Details

### Task 7.S: Release and UAT scenarios [QA]
**Status:** [NOT STARTED]  
**Story Points:** 5  
**Wireframe:** All approved product wireframes

**Deliverables:** End-to-end UAT, security, restore and rollback scenarios for US-020 and all core journeys.  
**Acceptance Criteria:** Product Owner approves data, devices, roles and expected evidence.

### Task 7.1: Security and performance hardening [Security/Backend]
**Status:** [NOT STARTED]  
**Story Points:** 8  
**Wireframe:** -

**Deliverables:** OWASP review fixes, WAF/origin controls, load tests and dependency audit.  
**Acceptance Criteria:** No open Critical/High issue and performance targets pass agreed load.

### Task 7.2: Backup, restore and observability [DevOps]
**Status:** [NOT STARTED]  
**Story Points:** 8  
**Wireframe:** -

**Deliverables:** Automated backup, restore drill, alerts, dashboards and runbooks.  
**Acceptance Criteria:** Restore meets approved RPO/RTO and failed backup alerts are observed.

### Task 7.3: Responsive, i18n and accessibility polish [Frontend]
**Status:** [NOT STARTED]  
**Story Points:** 8  
**Wireframe:** All approved product wireframes

**Deliverables:** Full mobile/desktop, Vietnamese/English and WCAG 2.2 AA review fixes.  
**Acceptance Criteria:** No Critical/High accessibility or overflow issue in supported browsers.

### Task 7.4: Initial data, documentation and training [BA/DevOps]
**Status:** [NOT STARTED]  
**Story Points:** 5  
**Wireframe:** -

**Deliverables:** Approved seed/import, operator guide, training and rollback checklist.  
**Acceptance Criteria:** Owner/Staff complete representative tasks using the guide.

### Task 7.R: Final code and release review [Code Review]
**Status:** [NOT STARTED]  
**Story Points:** 5  
**Wireframe:** -

**Deliverables:** Final architecture, security, migration and release review.  
**Acceptance Criteria:** LGTM with no unresolved release blocker.

### Task 7.Q: Final QA and browser acceptance [QA]
**Status:** [NOT STARTED]  
**Story Points:** 8  
**Wireframe:** All approved product wireframes

**Deliverables:** Full regression, UAT evidence and witnessed Browser Acceptance Test.  
**Acceptance Criteria:** All stories pass, coverage target holds and Product Owner signs UAT.

## Sprint Backlog

| ID | Task | Points | Status | Assignee | Wireframe |
|----|------|--------|--------|----------|-----------|
| 7.S | Release/UAT scenarios | 5 | | QA | All approved wireframes |
| 7.1 | Security/performance hardening | 8 | | Security/Backend | - |
| 7.2 | Backup/restore/observability | 8 | | DevOps | - |
| 7.3 | Responsive/i18n/accessibility polish | 8 | | Frontend | All approved wireframes |
| 7.4 | Initial data/docs/training | 5 | | BA/DevOps | - |
| 7.R | Final code/release review | 5 | | Code Review | - |
| 7.Q | Final QA/browser acceptance | 8 | | QA | - |

## Sprint Summary

**Total:** 7 tasks · 47 points · final release sprint.

## Definition of Done

- [ ] Security, performance, backup/restore and rollback gates pass.
- [ ] Full regression/UAT and witnessed Browser Acceptance Test pass.
- [ ] Code review LGTM, QA approved and CEO release checklist complete.

## Dependencies and Risks

- Depends on all prior sprints and production hosting/edge provider selection.
- Excel import is included only if Product Owner confirms it for MVP and supplies source data.
- Go-live is blocked until restore drill, authorization matrix and rollback plan are evidenced.
