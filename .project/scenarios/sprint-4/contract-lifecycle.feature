@sprint-4 @lifecycle @contracts
Feature: Contract lifecycle and daily operations
  As an Owner or Staff member
  I want reservations to move through renting, overdue, returned and cancelled states with history
  So that vehicle availability, extensions, swaps and the daily board stay trustworthy

  Background:
    Given an authenticated rental workspace
    And all customers, vehicles and contracts are synthetic fixtures
    And rental intervals use Asia/Ho_Chi_Minh business time with an exclusive end boundary
    And timestamps are persisted in UTC

  @US-014 @US-015 @state-machine @unit
  Scenario Outline: Only approved lifecycle transitions are allowed
    Given a contract in state <from>
    When the transition <transition> is requested
    Then the transition is <outcome>

    Examples:
      | from      | transition | outcome  |
      | CONFIRMED | ACTIVATE   | allowed  |
      | CONFIRMED | CANCEL     | allowed  |
      | CONFIRMED | COMPLETE   | rejected |
      | ACTIVE    | OVERDUE    | allowed  |
      | ACTIVE    | COMPLETE   | allowed  |
      | ACTIVE    | CANCEL     | rejected |
      | OVERDUE   | COMPLETE   | allowed  |
      | OVERDUE   | ACTIVATE   | rejected |
      | COMPLETED | CANCEL     | rejected |
      | CANCELLED | ACTIVATE   | rejected |

  @lifecycle @transition @integration
  Scenario: Handover moves a reservation into renting and rents the vehicles
    Given a confirmed contract "HD-TEST" with vehicle "XE-001"
    When Staff records the handover
    Then the contract status is ACTIVE with an activation timestamp
    And vehicle "XE-001" status is RENTED with a status-history entry naming "HD-TEST"
    And an audit event CONTRACT_ACTIVATED stores the actor

  @lifecycle @transition @integration
  Scenario: Forbidden transitions return status 409 without side effects
    Given a completed contract
    When Staff tries to cancel it
    Then the API returns status 409 with code INVALID_TRANSITION
    And the contract, its vehicles and the audit log are unchanged

  @lifecycle @overdue @timezone @idempotent @integration
  Scenario: Scheduled evaluation marks overdue contracts exactly once
    Given an active contract scheduled to end at "2026-10-06 08:00"
    When the overdue evaluation runs at "2026-10-06 07:59"
    Then the contract remains ACTIVE
    When the overdue evaluation runs at "2026-10-06 08:00"
    Then the contract status is OVERDUE with overdueSince "2026-10-06 08:00"
    And exactly one audit event CONTRACT_OVERDUE exists
    When the overdue evaluation runs again one hour later
    Then no additional audit event or timeline entry is created

  @lifecycle @overdue @grace @unit
  Scenario: Grace period affects fees, not the overdue state
    Given an overdue contract with a 60-minute grace policy
    When the vehicle is returned 30 minutes after the scheduled end
    Then the late-return fee is 0 VND
    And the contract was still shown as overdue before the return

  @US-014 @BR-07 @cancel @audit @integration
  Scenario: Cancellation keeps the record and records actor plus reason
    Given a confirmed contract "HD-TEST" holding vehicle "XE-001" from "2026-10-01 08:00" to "2026-10-06 08:00"
    When Staff cancels it without a reason
    Then the API returns status 400
    When Staff cancels it with reason "Khách đổi lịch"
    Then the contract status is CANCELLED with the actor, reason and cancellation time
    And vehicle "XE-001" is AVAILABLE and can be booked for the same interval
    And the cancelled contract still appears in the contract list with its lines
    And an audit event CONTRACT_CANCELLED stores the reason

  @US-014 @extension @conflict @transaction @integration
  Scenario: Extension is rejected when the extra range conflicts
    Given an active contract "HD-A" holding vehicle "XE-001" until "2026-10-06 08:00"
    And another contract "HD-B" holds vehicle "XE-001" from "2026-10-07 08:00"
    When Staff extends "HD-A" to "2026-10-08 08:00"
    Then the API returns status 409 naming vehicle "XE-001" and contract "HD-B"
    And "HD-A" still ends at "2026-10-06 08:00" with its original total
    And no extension history entry exists

  @US-014 @PD-06 @extension @repricing @integration
  Scenario: Extension reprices the whole period by the final tier and stores before/after history
    Given an active contract with one scooter from "2026-10-01 08:00" to "2026-10-06 08:00" priced 5 × 130000 VND from pricing version 1
    And the Owner has since published pricing version 2
    When Staff confirms the new return date "2026-10-08 08:00"
    Then the line covers 7 billable days at 100000 VND per day from pricing version 1
    And the contract total changes from 650000 to 700000 VND
    And the timeline stores previous end, new end, previous total and new total
    And an audit event CONTRACT_EXTENDED stores the actor and before/after values

  @US-014 @extension @validation @unit
  Scenario: Extension must move the return date later
    Given an active contract ending at "2026-10-06 08:00"
    When Staff requests a new end of "2026-10-05 08:00"
    Then the API returns status 400 explaining the end must be later than the current end

  @US-015 @swap @conflict @integration
  Scenario: Swap is rejected when the replacement is not available
    Given an active contract "HD-A" renting vehicle "XE-001"
    And vehicle "XE-002" is RENTED by another contract
    When Staff swaps "XE-001" for "XE-002" with reason "Xe hỏng đèn"
    Then the API returns status 409
    And "HD-A" still rents only "XE-001"

  @US-015 @swap @history @integration
  Scenario: Swap ends the old line and links the replacement
    Given an active contract "HD-A" renting vehicle "XE-001" until "2026-10-06 08:00"
    And vehicle "XE-003" of the same type is AVAILABLE
    When Staff swaps "XE-001" for "XE-003" with reason "Xe hỏng đèn" at "2026-10-03 10:00"
    Then the old line ends at "2026-10-03 10:00" and references the new line
    And the new line rents "XE-003" until "2026-10-06 08:00" and references the old line
    And the contract total is unchanged
    And vehicle "XE-001" is AVAILABLE and vehicle "XE-003" is RENTED
    And the timeline stores the actor, reason and both vehicles

  @lifecycle @completion @BR-03 @integration
  Scenario: Completing a contract releases its vehicles
    Given an overdue contract renting vehicle "XE-001"
    When Staff marks the contract as returned
    Then the contract status is COMPLETED with a completion timestamp
    And vehicle "XE-001" is AVAILABLE
    And the completed contract no longer blocks new bookings

  @lifecycle @list @filter @integration
  Scenario: Contract list filters by status and search
    Given contracts in states CONFIRMED, ACTIVE and CANCELLED
    When Staff lists contracts with status ACTIVE
    Then only active contracts are returned with code, customer, vehicles, interval, total and status
    When Staff searches by contract code
    Then only the matching contract is returned

  @board @dashboard @timezone @integration
  Scenario: Operations board separates due today from overdue using business time
    Given "now" is "2026-10-06 15:00" in Asia/Ho_Chi_Minh
    And an active contract ends at "2026-10-06 23:30" Asia/Ho_Chi_Minh
    And another active contract ended at "2026-10-06 09:00" Asia/Ho_Chi_Minh
    And a confirmed contract starts at "2026-10-07 00:30" Asia/Ho_Chi_Minh
    When Staff loads the operations board
    Then the first contract is listed as due today
    And the second contract is listed as overdue with 6 hours late
    And the third contract is not part of the board for today
    And KPIs report available vehicles, active rentals, due today and overdue counts

  @board @priority @e2e
  Scenario: Dashboard shows overdue first with explicit hours late
    Given the operations board returns one overdue and one due-today contract
    When Staff opens the dashboard
    Then the KPI "Quá hạn" shows the longest delay in hours
    And the priority list shows the overdue contract before the due-today one
    And each priority item links to the contract detail
    And the layout works at a 360 pixel viewport

  @board @empty @error @e2e
  Scenario: Dashboard empty and error states keep the shell
    Given the operations board returns no due-today or overdue contracts
    When Staff opens the dashboard
    Then the message "Không có việc gấp hôm nay" and a link to the fleet list are shown
    When the board request fails
    Then the dashboard shows "Không thể tải tổng quan" with a retry action
    And no zero KPI is shown as loaded data

  @US-014 @US-015 @lifecycle @e2e
  Scenario: Staff manages a contract from the detail page
    Given Staff opens a confirmed contract detail
    When Staff records the handover
    Then the status badge reads "Đang thuê" and the timeline shows the handover entry
    When Staff extends the contract to a later date
    Then the new end date and the new total are displayed
    When Staff swaps the vehicle with a reason
    Then both vehicle lines are shown with the replacement link
    And the cancel action requires a reason and a destructive confirmation
