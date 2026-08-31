# Sprint 0: Discovery, Architecture and UI Design

**Sprint:** 0 of 8  
**Duration:** Planning checkpoint driven  
**Goal:** Chốt contract về yêu cầu, kỹ thuật và UI trước khi viết ứng dụng.  
**Status:** COMPLETE — GATE 1 PASSED

## Task Details

### Task 0.S: Requirements and BDD Readiness [BA]
**Status:** [COMPLETE]  
**Story Points:** 5  
**Wireframe:** -

**Deliverables:**
- [x] `.project/requirements/srs.md`
- [x] `.project/requirements/user-stories.md`
- [x] `.project/requirements/scope.md`

**Acceptance Criteria:**
- [x] 83 source features grouped and prioritized.
- [x] Sprint 1 stories contain Given/When/Then.
- [x] Pending decisions are explicit, not silently assumed.

### Task 0.1: Project Context and Scope [BA]
**Status:** [COMPLETE]  
**Story Points:** 3  
**Wireframe:** -

**Deliverables:**
- [x] `.project/project-context.md`
- [x] `.project/implementation-plan.md`

**Acceptance Criteria:**
- [x] Client intent to stop after Sprint 1 UI review is recorded.
- [x] Sprint 1 demo scope is separated from production-complete features.

### Task 0.2: Tech Stack and Architecture [CTO]
**Status:** [COMPLETE]  
**Story Points:** 5  
**Wireframe:** -

**Deliverables:**
- [x] `.project/documentation/tech-stack.md`
- [x] `.project/documentation/architecture.md`

**Acceptance Criteria:**
- [x] Modular monolith and Sprint 1 demo adapter are defined.
- [x] Sprint 1 file blueprint is explicit.
- [x] Security and production/demo separation are documented.

### Task 0.3: Skill Gap and Team Proposal [HR]
**Status:** [COMPLETE]  
**Story Points:** 2  
**Wireframe:** -

**Deliverables:**
- [x] `.project/documentation/team.md`

**Acceptance Criteria:**
- [x] Required capabilities verified.
- [x] All SDLC phases covered.

### Task 0.4: Design Direction and Design System [UX]
**Status:** [COMPLETE]  
**Story Points:** 5  
**Wireframe:** -

**Deliverables:**
- [x] Three high-fidelity Dashboard comparison images in `.project/design-previews/`.
- [x] User selects UI 3 — Soft Modern.
- [x] `.project/design-system.md`

**Acceptance Criteria:**
- [x] Concrete colors, typography, spacing, radius, shadow and motion tokens.
- [x] Accessible status colors suitable for operational dashboards.

**Approval:** Design artifact is complete and awaiting client approval at Gate 1.

### Task 0.5: Desktop and Mobile Wireframes [UX]
**Status:** [COMPLETE]  
**Story Points:** 8  
**Wireframe:** -

**Deliverables:**
- [x] App shell and login wireframes.
- [x] Dashboard and module preview wireframes.
- [x] Components and key flows.

**Acceptance Criteria:**
- [x] Desktop/mobile layouts and loading/empty/error/denied states covered.
- [x] Every Sprint 1 story has a corresponding screen/flow.

### Task 0.R: Sprint 0 Artifact Review [Code Review]
**Status:** [COMPLETE]  
**Story Points:** 2  
**Wireframe:** -

**Deliverables:**
- [x] Traceability and consistency review.
- [x] `.project/reviews/sprint-0-artifact-review.md`

**Acceptance Criteria:**
- [x] No unresolved contradiction between SRS, architecture, wireframes and backlog.
- [x] Final review verdict: LGTM.

### Task 0.Q: Gate 1 Verification [QA]
**Status:** [COMPLETE]  
**Story Points:** 3  
**Wireframe:** -

**Deliverables:**
- [x] Gate 1 structural preflight result.
- [x] Approved Sprint 1 BDD scenario set.

**Acceptance Criteria:**
- [x] User approval is recorded before Sprint 1 development.

## Sprint Backlog

| ID | Task | Points | Status | Assignee | Wireframe |
|----|------|--------|--------|----------|-----------|
| 0.S | Requirements and BDD readiness | 5 | [COMPLETE] | BA | - |
| 0.1 | Project context and scope | 3 | [COMPLETE] | BA | - |
| 0.2 | Tech stack and architecture | 5 | [COMPLETE] | CTO | - |
| 0.3 | Skill gap and team proposal | 2 | [COMPLETE] | HR | - |
| 0.4 | Design direction and design system | 5 | [COMPLETE] | UX | - |
| 0.5 | Desktop and mobile wireframes | 8 | [COMPLETE] | UX | `wireframes/` |
| 0.R | Sprint 0 artifact review | 2 | [COMPLETE] | Code Review | - |
| 0.Q | Gate 1 verification | 3 | [COMPLETE] | QA | - |

## Sprint Summary

| Metric | Value |
|---|---:|
| Total Tasks | 8 |
| Completed | 8 |
| Blocked | 0 |
| Story Points | 33 |
| Completed Points | 33 |

## Definition of Done

### Functional Criteria
- [x] SRS and user stories drafted from workbook.
- [x] Tech stack, architecture and team proposed.
- [x] Design direction selected.
- [x] Design system and all Sprint 1 wireframes approved.
- [x] Sprint 1 BDD scenarios approved.

### Quality Criteria
- [x] Artifact review reports no contradiction (LGTM).
- [x] Gate 1 passes.
- [ ] No application implementation starts before Gate 1.

## Dependencies

| Dependency | Reason | Status |
|---|---|---|
| Task 0.4 → Task 0.5 | Wireframes require selected design tokens | Complete |
| Task 0.5 → Task 0.R | Review requires finished wireframes | Ready |
| Task 0.R → Task 0.Q | Gate follows artifact review | Complete; preflight run |

## Risks & Blockers

| # | Type | Description | Impact | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|
| 1 | Approval | Design system/wireframes approval | High | Approved at Gate 1 | Client | Closed |
| 2 | Risk | Business pricing rules still pending | Medium for Sprint 1, High later | Keep UI preview non-transactional | BA | Open |

## Notes

- Sprint 1 is approved in intent but not cleared for development until Gate 1.
- Later sprint execution remains deferred until the client reviews Sprint 1 UI.

## Sprint Retrospective

- Planning artifacts benefited from explicit traceability and a separate production/demo contract.
- Client workbook samples were archived privately and linked to future sprint dependencies.
- Gate 1 passed without creating application code prematurely.
