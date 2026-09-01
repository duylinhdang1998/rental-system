@sprint-8 @frontend @architecture @remediation
Feature: Approved frontend architecture and operational interaction patterns
  As an Owner or Staff member
  I want the admin interface to use one accessible component foundation
  So that every current and future module stays consistent and maintainable

  Background:
    Given an authenticated rental workspace
    And all test people and identifiers are synthetic

  @US-021 @unit @architecture
  Scenario: Application code uses shadcn and Radix primitives
    Given the React admin source tree
    When the frontend architecture gate scans application components
    Then shadcn configuration and Radix dependencies are present
    And native button, input, select and textarea elements exist only inside shared UI primitives
    And Inter is the primary sans-serif font

  @US-021 @unit @architecture
  Scenario: Feature code is nested and hooks have a dedicated boundary
    Given the auth, fleet, customer, contract, dashboard and settings features
    When their source layout is inspected
    Then route pages, components, hooks, API adapters and utilities are grouped by responsibility
    And hook modules are stored under a hooks folder
    And component modules do not declare state or query hooks

  @US-021 @e2e @responsive
  Scenario: Fleet actions stay on one line at mobile width
    Given Staff opens the fleet list at 360 pixels
    Then Lịch xe and Thêm xe stay on one line
    And each action meets the 44 pixel touch target
    And there is no page-level horizontal overflow

  @US-021 @e2e @dialog @accessibility
  Scenario: Staff adds a vehicle in a dedicated dialog
    Given Staff is viewing the vehicle list
    Then the add-vehicle form is not inserted into the list content
    When Staff activates Thêm xe
    Then a dialog titled Thêm xe opens
    And focus moves into the dialog
    And closing the dialog returns Staff to the unchanged vehicle list

  @US-021 @e2e @dialog @calendar @accessibility
  Scenario: Staff opens availability in a dedicated overlay
    Given Staff is viewing the vehicle list
    When Staff activates Lịch xe
    Then a dedicated availability overlay titled Lịch xe opens
    And the calendar grid is visible inside the overlay
    And Staff can close the overlay without changing fleet filters

  @US-021 @integration @e2e @created-at
  Scenario: Business records expose and display their creation time
    Given vehicle, customer, pricing and contract records exist
    When each record is returned by its API contract
    Then it includes an ISO createdAt value
    When Staff views the vehicle and customer lists
    Then a localized Ngày tạo value is visible for each record on desktop and mobile
