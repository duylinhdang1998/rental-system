@sprint-7 @hardening @release @uat
Feature: Security hardening, observability and go-live readiness
  As the Owner and the delivery team
  I want the API to resist abuse, prove it can be restored and expose what changed
  So that the store can go live with real customer, contract and money data

  Background:
    Given the rental API runs with the production security policy
    And every account, contract and payment in these scenarios is a synthetic fixture
    And no password, session token, cookie or personal document ever appears in a log line

  @US-020 @security @throttling @integration
  Scenario: Abusive read traffic is throttled per session and per client
    Given Staff is signed in
    When the same session sends more read requests than the read policy allows within one minute
    Then the request over the limit is rejected with 429 and a Retry-After header
    And the response carries the normalized error body with a request identifier
    And a REQUEST_RATE_LIMITED security event names the policy but never the session token
    And the next minute the session can read again

  @US-020 @security @throttling @integration
  Scenario: Mutations and exports have tighter policies than reads
    Given the Owner is signed in
    When the Owner sends more mutations than the mutation policy allows within one minute
    Then the request over the limit is rejected with 429
    When the Owner downloads the revenue workbook more often than the export policy allows
    Then the download over the limit is rejected with 429
    And read requests from the same session are still served

  @US-020 @security @limits @integration
  Scenario: Oversized request bodies are refused before validation
    When any client posts a JSON body larger than the configured body limit
    Then the API answers 413 with the normalized error body
    And the response never echoes the submitted body

  @US-020 @security @headers @integration
  Scenario: Every response carries the hardened header set
    When any client calls the health endpoint
    Then the response has Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options and Referrer-Policy headers
    And the response has no X-Powered-By header
    And the response carries the x-request-id used in the logs

  @US-020 @observability @readiness @integration
  Scenario: Readiness reflects the database while liveness stays cheap
    When the load balancer calls the liveness endpoint
    Then it receives 200 with the service name
    When the load balancer calls the readiness endpoint
    Then it receives the database check result and the running version
    And a database failure turns readiness into 503 without changing liveness

  @US-020 @observability @logging @integration
  Scenario: Requests are logged as structured JSON with redaction
    Given Staff signs in and reads a contract
    When the structured log is inspected
    Then each line is one JSON object with time, level, event, request id, method, route, status, duration and actor
    And the login line contains no password, no session token and no cookie value
    And the security event line for a throttled request names only the policy and the client identifier

  @US-020 @audit @authorization @integration
  Scenario: Owner reviews sensitive changes in the audit log
    Given the Owner overrode a vehicle price with a reason (overrides are Owner-only)
    And Staff recorded a payment on a contract
    When the Owner opens the audit log filtered by entity type
    Then each entry shows the actor name, the time, the action, the entity and its metadata
    And the price override entry shows the reason, the old price and the new price
    And entries are ordered newest first and limited to the requested page size
    And Staff receives 403 when calling the same endpoint

  @US-020 @backup @restore @drill
  Scenario: Daily backup is restored into a scratch database and verified
    Given the backup script produced a compressed custom-format dump with a timestamped name
    When the restore drill restores it into a scratch database
    And the verification command compares table counts and reconciles the payment ledger
    Then the drill reports the row counts, the ledger reconciliation and PASS
    And a backup older than the alert threshold makes the age check exit non-zero

  @US-020 @backup @verification @unit
  Scenario Outline: Restore verification reconciles the ledger and rejects an empty restore
    Given a restored snapshot with <contracts> contracts, <payments> payments and <accounts> accounts
    And the settlement paid figures differ from the ledger in <mismatches> contracts
    Then the verification result is <result>

    Examples:
      | contracts | payments | accounts | mismatches | result |
      | 12        | 30       | 3        | 0          | PASS   |
      | 12        | 30       | 3        | 1          | FAIL   |
      | 0         | 0        | 0        | 0          | FAIL   |
      | 5         | 0        | 1        | 0          | PASS   |

  @US-020 @release @rollback
  Scenario: Deploy and rollback follow the runbook
    Given the release checklist is complete and the previous image tag is recorded
    When the new API version fails its readiness probe after deploy
    Then the previous image is redeployed and migrations are rolled back only if the runbook lists them as reversible
    And the incident is recorded with the request identifiers from the structured log

  @US-020 @seed @initial-data
  Scenario: Production starts with one Owner account and no demo data
    Given the production environment has DEMO_MODE=false and explicit secrets
    When the operator runs the owner seed command with the Owner credentials from the environment
    Then exactly one active Owner account exists with an argon2 password hash
    And running the command again reports the existing account and changes nothing
    And the production API rejects startup when demo mode or default secrets are configured

  @polish @i18n @unit
  Scenario: Vietnamese and English translation trees stay in parity
    When the translation resources are compared key by key
    Then every English key has a Vietnamese value and vice versa
    And no translation value is empty

  @polish @accessibility @responsive @e2e
  Scenario: Every workspace page passes the accessibility and overflow sweep
    Given the Owner is signed in
    When each route is opened at a 360 pixel and a 1280 pixel viewport
    Then axe reports no serious or critical WCAG 2.2 AA violation
    And the page has exactly one level-one heading and no horizontal overflow
    And every form control on the page has an accessible name

  @release @dependencies @ci
  Scenario: Dependency audit and browser gates run in CI
    When the quality-gates workflow runs
    Then the production dependency audit reports no high or critical advisory
    And formatting, lint, typecheck, unit/integration and browser suites pass
