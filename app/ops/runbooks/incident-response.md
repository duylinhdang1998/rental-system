# Runbook — Incident response

**Incident owner:** DevOps on call, with the Product Owner (Chủ cửa hàng) as the business
contact. **Channel:** the shop's agreed chat group plus a written record in the release log.

## Severity

| Level | Meaning                                                                               | Response                                       |
| ----- | ------------------------------------------------------------------------------------- | ---------------------------------------------- |
| SEV-1 | Staff cannot rent, return or collect money (API down, data loss, wrong money figures) | Respond within 15 minutes, work until restored |
| SEV-2 | One function broken with a workaround (export fails, audit log slow)                  | Same business day                              |
| SEV-3 | Cosmetic or single-user issue                                                         | Next release                                   |

## Steps

1. **Acknowledge** in the channel with the alert text and the `x-request-id` from the user
   when there is one.
2. **Stabilize**: if a deploy happened in the last 24 hours, roll back first
   (`deploy-rollback.md`), then investigate. If the database is unreachable, follow the
   provider's failover and check `GET /api/health/ready`.
3. **Contain data issues**: stop the API before any restore; never edit ledger, charge or
   settlement rows by hand (they are immutable by design). Corrections are new rows recorded
   through the API by the Owner, so the audit log keeps the trail.
4. **Security events**: for repeated `LOGIN_RATE_LIMITED` from one client, lock the targeted
   account from `/employees` if a real employee is being targeted, and add the identifier to the
   edge block list. For a suspected session theft, lock the account (all sessions end) and reset
   its password.
5. **Communicate** to the Owner what stopped, what is restored, and what data (if any) must be
   re-entered, in Vietnamese.
6. **Close** with a short written post-mortem: timeline, cause, fix, prevention. Add the
   prevention item to the tracker.

## Contacts and secrets

Provider consoles, secret manager entries and the off-site backup bucket are listed in the
private operations sheet, not in this repository.
