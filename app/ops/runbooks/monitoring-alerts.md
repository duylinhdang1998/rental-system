# Runbook — Monitoring and alerts

## Signals the API already emits

- One JSON line per request (`event: http.request`) with `requestId`, `route` template,
  `status`, `durationMs`, pseudonymous `actorId` and `clientIp`. Level is `warn` for 4xx and
  `error` for 5xx. Credential-like fields are redacted before the line is written.
- `event: security.event` lines for `LOGIN_RATE_LIMITED` and `REQUEST_RATE_LIMITED` with the
  policy name and a client identifier (IP or a 16-character session hash prefix, never the
  session token).
- `event: http.error` lines for unhandled 5xx with the stack, keyed by `requestId`; the client
  only receives the request id.
- `GET /api/health` (liveness, no dependencies) and `GET /api/health/ready` (database probe
  with a 2 s timeout, 503 when unavailable, plus `uptimeSeconds` and `version`).
- Every response carries `x-request-id`; ask the user for it when they report a problem.

## Alerts (page)

| Alert                      | Condition                                   | First action                                                    |
| -------------------------- | ------------------------------------------- | --------------------------------------------------------------- |
| API down                   | readiness 503 or no response for 2 minutes  | `incident-response.md`                                          |
| 5xx spike                  | more than 5 `http.error` lines in 5 minutes | Read the stack by request id, roll back if the deploy is recent |
| Backup stale               | `check-backup-age.mjs` exits 1              | Run the backup by hand, then fix the scheduler                  |
| Restore drill FAIL         | `restore.verify` reports `ok:false`         | Block releases, inspect the issues array                        |
| Disk or DB pool saturation | host metrics                                | Scale or purge, then check retention                            |

## Alerts (ticket)

| Alert             | Condition                                                             |
| ----------------- | --------------------------------------------------------------------- |
| Throttle pressure | more than 50 `REQUEST_RATE_LIMITED` in 10 minutes from one identifier |
| Login abuse       | more than 20 `LOGIN_RATE_LIMITED` in 10 minutes                       |
| Latency           | p95 of `durationMs` above 500 ms for 15 minutes                       |
| Export volume     | more than 20 `route: /api/reports/revenue/export` lines per day       |

## Dashboards

Requests per minute by status class, p50/p95 latency by route, throttle events by policy,
readiness state, backup age, restore drill result, database connections. All are derived from
the JSON log lines and the two health endpoints; no extra instrumentation is required for MVP.
