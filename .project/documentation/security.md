# Backend Security Plan — NestJS API

**Version:** 1.0  
**Date:** 2026-08-31  
**Status:** PROPOSED FOR SPRINT 1 IMPLEMENTATION AND REVIEW

## Security position

Security is implemented in layers. NestJS protects the application, but application middleware alone cannot stop a volumetric DDoS attack. Production traffic must pass through a managed CDN/WAF and load balancer; the API origin must reject direct public access.

```text
Internet
  → CDN / DDoS protection / WAF / bot rules
  → TLS load balancer / reverse proxy / request limits
  → NestJS guards, throttling, validation and authorization
  → application policies and transactions
  → PostgreSQL / private object storage / audit log
```

## Controls by layer

| Layer | Required controls | Sprint 1 evidence |
|---|---|---|
| Edge | Managed DDoS protection, WAF managed rules, bot/challenge mode, IP reputation, TLS | Infrastructure contract + staging configuration checklist |
| Origin | Only edge/load-balancer IPs allowed, HTTPS, request/body/header limits, idle and upstream timeouts | Deployment config review |
| NestJS | Helmet, explicit CORS, global validation pipe, exception filter, throttler guard, secure cookie/session, CSRF, RBAC | Integration tests and security review |
| Domain | Deny-by-default authorization, ownership rules, state checks, immutable finance/audit history | Policy tests |
| Data | Least-privilege DB user, encryption in transit/at rest, private files, signed URLs, backup/restore | Configuration and restore evidence |
| Operations | Structured security events, redaction, alerting, dependency/secret scanning, incident runbook | CI and monitoring checklist |

## NestJS application baseline

- Use NestJS with the default Express adapter initially; keep framework-specific code at the delivery edge.
- Register `helmet` before routes and other middleware.
- Enable CORS from an environment-validated allowlist. Production never accepts wildcard origin with credentials.
- Enable a global `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true` and explicit DTO constraints.
- Limit JSON/form bodies and uploads before parsing large payloads.
- Normalize errors through a global exception filter. Production responses never expose stack traces, SQL details or secret/config values.
- Disable framework fingerprints and return a request/correlation ID with errors.

## Rate limiting and abuse prevention

Initial values are configuration defaults, not permanent truth. They are tuned from staging and production metrics without weakening the minimum protections.

| Scope | Initial policy | Key |
|---|---|---|
| General read API | 120 requests/minute | Trusted client IP + session/user when present |
| General mutation API | 30 requests/minute | User + IP |
| Login | 5 attempts/minute and 10 attempts/15 minutes | Normalized account + IP |
| Password reset request | 3 requests/15 minutes | Normalized account + IP |
| Export/report generation | 5 requests/10 minutes | User |
| Upload | 10 requests/10 minutes plus file-size quota | User + IP |

- Use `@nestjs/throttler` as a global guard with tighter per-route policies.
- Trust proxy headers only from the known load balancer; never blindly accept a client-supplied forwarding header.
- Failed logins use progressive delay/temporary lockout and a generic response that does not reveal whether an account exists.
- Counters must use a shared store before running more than one API instance. A local in-memory store is allowed only for single-instance development/staging.
- Edge WAF rules handle floods, bot traffic and network-level attacks before NestJS consumes CPU or connections.
- Set concurrency, queue, connection and request timeouts at the proxy/API/database layers to prevent resource exhaustion.

## Authentication and session security

- Passwords use Argon2id with parameters benchmarked on production-like hardware.
- Session identifiers are cryptographically random and stored server-side; rotate on login, privilege change and password reset.
- Cookie: `HttpOnly`, `Secure` in production, `SameSite=Lax`, scoped path/domain, explicit lifetime.
- Logout, account lock, password reset and staff termination revoke active sessions.
- Cookie-authenticated mutations require CSRF protection and origin/referer checks.
- Login and sensitive session events are logged without password, session ID, CSRF token or reset token.
- Optional MFA for Owner is scheduled before production go-live if the deployment is Internet-accessible.

## Authorization

- Global authentication guard; explicit public-route decorator is the only opt-out.
- Role and ownership policies run on the server for every protected request.
- Staff access to contracts/customers follows the approved workbook matrix and creator/assignment rules.
- Hiding a route or button in React is UX only and never grants security.
- Object IDs are validated and looked up through authorized services to prevent IDOR.
- Sensitive mutations record actor, request ID, entity, previous/new value summary, reason and timestamp.

## Input, query and output safety

- DTOs constrain type, length, enum, range and array size; unknown fields are rejected.
- Prisma parameterized queries are the default; raw SQL requires a documented review and bound parameters.
- Pagination has a hard maximum; search length and report date ranges are bounded.
- User content is rendered as text by default. Rich HTML is out of scope unless sanitized with an allowlist.
- Outbound URL fetching is deny-by-default to reduce SSRF risk; future integrations use a hostname allowlist, DNS/IP checks and timeouts.
- Responses exclude password hashes, session fields, internal notes and unnecessary PII through explicit response DTOs.

## Upload and file security

- Enforce per-route size limits, allowlisted extensions/MIME types and file-signature inspection.
- Rename files to generated IDs; never use the original filename as a storage path.
- Store customer documents and vehicle handover assets in private object storage.
- Serve downloads through short-lived signed URLs after authorization; do not proxy arbitrary storage keys from user input.
- Malware scanning/quarantine becomes mandatory before accepting production customer documents.
- Strip risky metadata when appropriate and never execute/interpret uploaded content on the API host.

## Logs, audit and monitoring

- Structured logs contain timestamp, level, request ID, route template, status, duration and pseudonymous actor ID.
- Redact authorization/cookie headers, passwords, tokens, customer documents, payment detail and request bodies by default.
- Security events: repeated login failure, temporary lockout, denied access, CSRF failure, rate-limit hit, invalid upload, account/role change and suspicious export volume.
- Metrics/alerts: 4xx/5xx spikes, throttled requests, p95 latency, connection saturation, DB pool saturation and origin traffic bypass attempts.
- Audit logs are append-only to application roles; retention and access are defined before production.

## Configuration, supply chain and deployment

- Validate all environment variables at startup; fail closed when production secrets or allowed origins are missing.
- Secrets live in a secret manager/environment injection, never repository or frontend bundles.
- CI runs lockfile installation, lint/typecheck/tests, dependency audit, secret scan and image/config scan when containers are introduced.
- Production database account has only required schema permissions; migrations use a separate controlled identity.
- Keep development, test, staging and production databases/accounts isolated.
- Daily encrypted backups and a successful restore drill are go-live requirements.

## Sprint 1 security test set

- Excess login attempts return `429` without revealing account existence.
- Spoofed forwarding headers do not bypass rate limiting.
- Unknown DTO fields and invalid lengths/types return normalized `400` errors.
- Missing/invalid CSRF token blocks cookie-authenticated mutation.
- Staff receives `403` for Owner-only endpoints and cannot bypass with direct URL/API calls.
- Locked staff session is revoked and protected endpoints return `401/403` as designed.
- CORS rejects an unapproved origin; production startup fails on wildcard credentialed configuration.
- Security headers are present and error responses contain no stack/secret/SQL detail.
- Demo endpoints are absent unless `DEMO_MODE` is explicitly enabled outside production.
- Log capture proves secrets, passwords and session identifiers are redacted.

## Go-live security gates

- [ ] Managed edge DDoS/WAF service configured and tested.
- [ ] Origin cannot be reached directly from the public Internet.
- [ ] Shared throttle/session strategy verified for the actual replica count.
- [ ] OWASP-focused review has no unresolved Critical/High finding.
- [ ] Backup restore drill succeeds.
- [ ] Incident owner, alert channel and rollback procedure are documented.
- [ ] Load/abuse test confirms limits fail safely without taking the API down.
