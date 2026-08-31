# Team Composition — Hệ thống quản lý cho thuê xe máy

**Complexity:** Standard  
**Current delivery scope:** Sprint 0 and Sprint 1  
**Status:** APPROVED ALLOCATION — 2 Backend + 2 Frontend

## Skill Gap Analysis

| Required capability | Verified specialist/skill | Match |
|---|---|---|
| UX, responsive wireframes, design system | `apple-ux-wireframer` | ✅ |
| React, Vite, Tailwind, TypeScript UI | `meta-react-architect` | ✅ |
| NestJS, TypeScript, Prisma, API and auth | `netflix-backend-architect` | ✅ |
| PostgreSQL schema and transactions | `postgresql` | ✅ |
| BDD, integration, E2E and QA | `google-qa-engineer` | ✅ |
| Code quality and security review | `google-code-reviewer` | ✅ |
| CI/CD, preview and deployment | `netflix-devops-engineer` | ✅ |
| OWASP and authorization hardening | `security-expert` | ✅ |

**Result:** No skill gap detected; dynamic hiring is not required.

## Core Roles

| Role | Phase | Responsibility |
|---|---|---|
| CEO | Intake/release | Scope and final sign-off |
| BA | Sprint 0/UAT | SRS, user stories, clarification, UAT |
| CTO | Architecture | Stack, security, data and file blueprint |
| HR | Staffing | Skill matching and SDLC coverage |
| PM | All | Planning, sequencing, gates and status |

## Specialist Personas

Trong Codex, các persona được áp dụng tuần tự trong cùng phiên làm việc; không chạy subagent song song.

| Specialist | Role | Sprint 0/1 responsibility |
|---|---|---|
| `apple-ux-wireframer` | UX | Chọn design direction, design system, wireframes, user flows |
| `google-qa-engineer` | QA/BDD | Sprint 1 scenarios, test skeleton, regression và sign-off |
| `netflix-backend-architect` — Backend #1 | Backend platform/security | NestJS scaffold, global guards/pipes/filters, throttling, errors, health, CI contract |
| `netflix-backend-architect` — Backend #2 | Backend identity/data | Session/auth, lockout, RBAC, Prisma, seed, audit and guarded demo endpoints |
| `meta-react-architect` — Frontend #1 | Frontend platform | React/Vite scaffold, app shell, design-system components, auth/i18n |
| `meta-react-architect` — Frontend #2 | Frontend product UI | Dashboard and module preview screens responsive |
| `postgresql` | Database review | Review schema, constraints và migration |
| `security-expert` | Security review | Review session, authorization, headers và demo/production separation |
| `google-code-reviewer` | Code review | Review toàn bộ Sprint 1; LGTM bắt buộc |
| `netflix-devops-engineer` | DevOps | CI, staging/preview, deployment safety |

## Sprint 1 Workstream Assignment

| Order | Specialist | Scope | Depends on |
|---:|---|---|---|
| 1 | google-qa-engineer | BDD scenarios and test skeleton | Approved Sprint 0 artifacts |
| 2 | Backend #1 | API/workspace foundation and shared server platform | Approved BDD |
| 3 | Backend #2 | Database, auth/RBAC, demo endpoints and contracts | Backend #1 foundation |
| 4 | Frontend #1 | React/Vite shell, login, design components and i18n | Approved wireframes + API contracts |
| 5 | Frontend #2 | Dashboard and module preview screens | Frontend #1 primitives |
| 6 | postgresql | Schema/transaction review | Backend implementation |
| 7 | security-expert | Auth/RBAC/CORS/CSRF review | Full implementation |
| 8 | google-code-reviewer | Sprint code review | Dev complete, build green |
| 9 | google-qa-engineer | Full regression, coverage, desktop/mobile E2E | Review fixes complete |
| 10 | netflix-devops-engineer | Preview deployment and smoke check | QA approved |

## Ownership Boundaries

| Workstream | Primary scope | Shared-file rule |
|---|---|---|
| Backend #1 | `app/apps/api/src/{main,app.module,config,common,modules/health}` | Completes NestJS/security scaffold before Backend #2 integrates modules |
| Backend #2 | `app/apps/api/src/modules/{auth,demo}`, `app/packages/{database,api-client}` | Owns Prisma schema and OpenAPI contract/client generation |
| Frontend #1 | `app/apps/admin/src/{app,shared,features/auth,features/employees,features/settings}` | Publishes shared UI before Frontend #2 uses it |
| Frontend #2 | `app/apps/admin/src/features/{dashboard,fleet,customers,contracts,returns,reporting}` | Does not modify shared primitives without Frontend #1 handoff |

The four workstreams are executed sequentially in Codex, even though ownership mirrors a 2-BE/2-FE team.

## SDLC Phase Coverage Verification

```text
Phase 1  Requirements ........ BA                         ✅
Phase 2a Architecture ........ CTO                        ✅
Phase 2b UX Design ........... apple-ux-wireframer        ✅
Phase 3  Development ......... backend + frontend         ✅
Phase 4  Testing ............. google-qa-engineer         ✅
Phase 5  Packaging ........... netflix-devops-engineer    ✅
Phase 6  Deployment .......... netflix-devops-engineer    ✅
Phase 7  Release ............. PM + CEO                   ✅
Code review .................. google-code-reviewer       ✅
Security ..................... security-expert            ✅
```

**STATUS:** ✅ All required capabilities and all seven SDLC phases covered.

## Approval Needed

Allocation 2 Backend + 2 Frontend was approved by the client on 2026-08-31. Support roles UX, QA, review, security and DevOps remain mandatory quality gates.
