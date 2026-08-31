@sprint-1 @ui-foundation
Feature: Secure responsive operations preview
  As an Owner or Staff member
  I want a secure responsive workspace with clearly labelled demo data
  So that I can validate the product UI before later business sprints begin

  Background:
    Given Sprint 1 demo mode is enabled outside production
    And the application supports the Owner and Staff roles

  @US-001 @auth @happy-path @integration @e2e
  Scenario: Active Owner signs in successfully
    Given an active Owner demo account exists
    When the Owner submits valid credentials
    Then a new server-side session is created
    And the user is sent to the operations dashboard
    And Owner-only navigation is visible

  @US-001 @auth @security @integration
  Scenario: Invalid credentials do not reveal whether an account exists
    When a user submits an unknown account with a password
    Then the login is rejected with the generic invalid-credentials message
    When a user submits a known account with a wrong password
    Then the login is rejected with the same generic invalid-credentials message
    And no password or session identifier is written to application logs

  @US-001 @auth @locked-account @unit @integration
  Scenario: Locked Staff cannot sign in or reuse an existing session
    Given a Staff demo account is locked
    And an earlier session fixture exists for that account
    When the Staff submits valid credentials
    Then login is rejected with a generic account-unavailable message
    When the earlier session calls a protected endpoint
    Then the endpoint rejects the session
    And historical audit data remains unchanged

  @US-001 @auth @rate-limit @security @integration
  Scenario: Repeated login attempts are throttled
    Given the login abuse policy is at its configured threshold for an account and client IP
    When another login attempt is submitted
    Then the API responds with status 429
    And the response gives a safe retry instruction
    And the response does not reveal whether the account exists
    And a rate-limit security event is recorded without credentials or session data

  @US-001 @security @csrf @integration
  Scenario: Cookie-authenticated mutation without CSRF proof is blocked
    Given an authenticated Owner session
    When a state-changing API request is submitted without valid CSRF proof
    Then the API rejects the request
    And no state is changed

  @US-002 @responsive @mobile @e2e
  Scenario: Staff navigates at a 360 pixel viewport
    Given an authenticated Staff user
    And the browser viewport is 360 pixels wide
    When the Staff opens every Sprint 1 primary route
    Then the bottom navigation targets are at least 44 by 44 pixels
    And entity tables are represented as mobile cards
    And there is no page-level horizontal overflow
    And identifiers, status, deadline and primary action remain visible

  @US-002 @view-state @e2e
  Scenario Outline: A route explains its non-success data state
    Given an authenticated user opens the dashboard
    When the API returns the <state> fixture
    Then the route renders the approved <state> view
    And the view provides a meaningful next action when one is possible
    And the app shell remains stable

    Examples:
      | state   |
      | loading |
      | empty   |
      | error   |

  @US-003 @dashboard @demo @e2e
  Scenario: Dashboard prioritizes today's operational work
    Given an authenticated Staff user
    And demo data contains available, rented, due-today and overdue vehicles
    When the Staff opens the dashboard
    Then KPI cards show available, rented, due-today and overdue counts
    And overdue items appear before due-soon and neutral schedule items
    And every preview route displays the persistent demo-data banner
    And the UI does not claim that a future business mutation was saved

  @US-003 @dashboard @accessibility @unit @e2e
  Scenario: Dashboard status does not rely on color alone
    Given dashboard demo data includes all supported operational statuses
    When the dashboard is rendered
    Then each status includes readable text
    And compact statuses include an icon where specified by the design system
    And chart information is also available as a text or table summary

  @US-004 @authorization @staff @integration @e2e
  Scenario Outline: Staff cannot access Owner-only routes
    Given an authenticated Staff user
    When the Staff directly opens <route>
    Then the route is absent from Staff navigation
    And the protected API returns status 403
    And the UI renders the approved access-denied view

    Examples:
      | route      |
      | reports    |
      | employees  |
      | settings   |

  @US-004 @authorization @owner @e2e
  Scenario: Owner can preview all Sprint 1 modules
    Given an authenticated Owner user
    When the Owner opens each Sprint 1 route
    Then dashboard, vehicles, customers, contracts and returns previews are available
    And reports, employees and settings previews are available
    And each unavailable future action states its target sprint

  @US-005 @localization @unit @e2e
  Scenario: Locale persists while route and filters are preserved
    Given an authenticated user viewing a filtered list in Vietnamese
    When the user switches the interface to English
    Then Sprint 1 navigation and interface labels change to English
    And dates and currency use the selected locale format
    And customer and business data is not translated
    When the user navigates to another route and back
    Then English remains selected
    And the current route and supported filter state are preserved

  @security @validation @integration
  Scenario: Unknown or invalid request fields are rejected safely
    Given a public or protected NestJS endpoint with a DTO contract
    When a request contains an unknown field or violates a length, type or range constraint
    Then the API responds with a normalized status 400 error
    And the response contains a request identifier
    And the response contains no stack trace, SQL detail or secret value

  @security @cors @unit @integration
  Scenario: Production API rejects an unapproved browser origin
    Given production CORS has an explicit allowed-origin list
    When a credentialed browser request comes from an unapproved origin
    Then the browser origin is not granted CORS access
    And production configuration cannot use a wildcard origin with credentials

  @security @demo-separation @unit @integration
  Scenario: Production cannot expose demo endpoints
    Given the API is starting in production mode
    When demo mode is unset or enabled
    Then the demo API namespace is not mounted
    And an unsafe demo configuration causes startup or deployment validation to fail
